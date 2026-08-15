"""
Rota simplificada para criação de pedidos sem integração com Stripe
Ideal para pedidos via WhatsApp
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db
from src.models.pedido import Pedido, ItemPedido, ItemPedidoAcrescimo, StatusPedido
from src.models.esfiha import Esfiha
from src.models.acrescimo import Acrescimo
from src.services.delivery_fee import DeliveryFeeCalculator
from src.services.whatsapp_service import WhatsAppService
from src.services.whatsapp_cliente_service import WhatsAppClienteService
from datetime import datetime
from zoneinfo import ZoneInfo

pedido_simples_bp = Blueprint("pedido_simples", __name__)


@pedido_simples_bp.route("", methods=["POST"])
def criar_pedido():
    """
    Cria um pedido simples (sem pagamento online).
    Pode ser usado por usuários não autenticados.
    Suporta pizza meio a meio e acréscimos.
    """
    dados = request.json

    # Validação básica de campos obrigatórios
    required_fields = ["nome_cliente", "telefone", "itens"]
    for field in required_fields:
        if not dados.get(field):
            return jsonify({
                "status": "error",
                "message": f"Campo obrigatório ausente: {field}"
            }), 400

    # Validar forma de entrega (padrão: entrega)
    forma_entrega = dados.get("forma_entrega", "entrega")
    if forma_entrega not in ["retirada", "entrega"]:
        return jsonify({
            "status": "error",
            "message": "Forma de entrega inválida. Use 'retirada' ou 'entrega'."
        }), 400

    # Se for entrega, endereço e número são obrigatórios
    if forma_entrega == "entrega":
        if not dados.get("endereco"):
            return jsonify({
                "status": "error",
                "message": "Endereço é obrigatório para entrega."
            }), 400
        
        if not dados.get("numero") or not dados.get("numero").strip():
            return jsonify({
                "status": "error",
                "message": "Número da residência é obrigatório para entrega."
            }), 400
        
        if not dados.get("cep_entrega") or not dados.get("cep_entrega").strip():
            return jsonify({
                "status": "error",
                "message": "CEP é obrigatório para entrega."
            }), 400

    valor_total_calculado = 0
    itens_pedido_info = []

    # Validar itens e calcular total
    for item_data in dados.get("itens", []):
        esfiha_id = item_data.get("esfiha_id") or item_data.get("id")
        quantidade = item_data.get("quantidade", 1)

        # isinstance(True, int) e True em Python: sem o teste de bool,
        # {"quantidade": true} virava pedido de 1 unidade em vez de erro.
        if (
            not esfiha_id
            or isinstance(quantidade, bool)
            or not isinstance(quantidade, int)
            or quantidade <= 0
        ):
            return jsonify({
                "status": "error",
                "message": f"Item inválido: {item_data}"
            }), 400

        esfiha = Esfiha.query.get(esfiha_id)
        if not esfiha:
            return jsonify({
                "status": "error",
                "message": f"Produto ID {esfiha_id} não encontrado."
            }), 404
            
        if not esfiha.disponivel:
            return jsonify({
                "status": "error",
                "message": f"Produto '{esfiha.nome}' não está disponível no momento."
            }), 400

        # Verificar se é pizza meio a meio
        eh_meio_a_meio = item_data.get("eh_meio_a_meio", False)
        esfiha_id_metade2 = item_data.get("esfiha_id_metade2")
        tamanho = item_data.get("tamanho")
        
        # Função auxiliar para obter preço baseado no tamanho
        def get_preco_por_tamanho(produto, tamanho_selecionado):
            if not tamanho_selecionado:
                return produto.preco
            
            if tamanho_selecionado == 'grande':
                return produto.preco_grande if produto.preco_grande else produto.preco
            elif tamanho_selecionado == 'media':
                return produto.preco_media if produto.preco_media else produto.preco
            elif tamanho_selecionado == 'broto':
                return produto.preco_broto if produto.preco_broto else produto.preco
            
            return produto.preco
        
        # Se for meio a meio, calcular preço baseado no maior valor E no tamanho
        if eh_meio_a_meio and esfiha_id_metade2:
            esfiha_metade2 = Esfiha.query.get(esfiha_id_metade2)
            if not esfiha_metade2:
                return jsonify({
                    "status": "error",
                    "message": f"Produto ID {esfiha_id_metade2} (segunda metade) não encontrado."
                }), 404
            
            if not esfiha_metade2.disponivel:
                return jsonify({
                    "status": "error",
                    "message": f"Produto '{esfiha_metade2.nome}' não está disponível no momento."
                }), 400
            
            # Obter preços baseados no tamanho selecionado
            preco1 = get_preco_por_tamanho(esfiha, tamanho)
            preco2 = get_preco_por_tamanho(esfiha_metade2, tamanho)
            
            # LOG: Mostrar cálculo de preço
            print(f"\n=== CÁLCULO MEIO A MEIO (PEDIDO SIMPLES) ===")
            print(f"Tamanho selecionado: {tamanho or 'padrão'}")
            print(f"Pizza 1: {esfiha.nome}")
            print(f"  - Preço base: R$ {esfiha.preco:.2f}")
            print(f"  - Preço {tamanho}: R$ {preco1:.2f}")
            print(f"Pizza 2: {esfiha_metade2.nome}")
            print(f"  - Preço base: R$ {esfiha_metade2.preco:.2f}")
            print(f"  - Preço {tamanho}: R$ {preco2:.2f}")
            
            # Preço da pizza meio a meio = maior preço entre as duas metades
            preco_base = max(preco1, preco2)
            print(f"✓ Preço final (MAX): R$ {preco_base:.2f}")
            print(f"===========================\n")
        else:
            # Para itens normais, usar preço baseado no tamanho
            preco_base = get_preco_por_tamanho(esfiha, tamanho)
        
        # Processar acréscimos do item
        acrescimos_item = item_data.get("acrescimos", [])
        total_acrescimos = 0
        
        for acrescimo_data in acrescimos_item:
            acrescimo_id = acrescimo_data.get("acrescimo_id")
            qtd_acrescimo = acrescimo_data.get("quantidade", 1)
            
            if acrescimo_id:
                acrescimo = Acrescimo.query.get(acrescimo_id)
                if acrescimo and acrescimo.disponivel:
                    total_acrescimos += acrescimo.preco * qtd_acrescimo
        
        # O acrescimo vale por UNIDADE, nao por linha do pedido.
        #
        # A conta era `(preco_base * quantidade) + total_acrescimos`: 3 pizzas
        # com bacon cobravam 3 pizzas e UM bacon. So que a tela do cliente
        # sempre somou por unidade — EsfihaModal.js faz
        # `(basePrice + extrasPrice) * quantity` —, entao o cliente via R$
        # 105,00, confirmava, e o sistema registrava R$ 95,00. Nao era escolha
        # de preco: era o frontend e o backend discordando, com a loja pagando
        # a diferenca em todo pedido de mais de uma unidade com acrescimo.
        subtotal = (preco_base + total_acrescimos) * quantidade
        valor_total_calculado += subtotal
        
        itens_pedido_info.append({
            "esfiha_id": esfiha_id,
            "quantidade": quantidade,
            "preco_unitario": preco_base,
            "observacoes": item_data.get("observacoes", ""),
            "acrescimos": acrescimos_item,
            "eh_meio_a_meio": eh_meio_a_meio,
            "esfiha_id_metade2": esfiha_id_metade2,
            "tamanho": tamanho,
            "tipo_massa": item_data.get("tipo_massa")
        })

    if not itens_pedido_info:
        return jsonify({
            "status": "error",
            "message": "O pedido deve conter pelo menos um item."
        }), 400

    # Taxa de entrega: recalculada AQUI, não aceita como veio do navegador.
    #
    # Esta rota é a do checkout do cliente — pública, sem login. A linha
    # anterior era `float(dados.get("taxa_entrega", 0.0))`: quem mandasse o
    # POST direto escolhia a própria taxa. Com 0 saía frete grátis; com um
    # número NEGATIVO o total do pedido caía abaixo do preço dos produtos.
    #
    # A distância continua vindo do navegador porque é ela que o cliente
    # calculou na tela (por /api/delivery/calcular-distancia-e-taxa), mas o
    # PREÇO dela sai da mesma tabela que o resto do sistema usa. Mentir na
    # distância ainda é possível; mentir no valor, não.
    distancia_km = dados.get("distancia_km")
    taxa_entrega = 0.0

    if forma_entrega == "entrega":
        if distancia_km is not None:
            try:
                distancia_km = float(distancia_km)
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "message": "Distância inválida. Deve ser um número."
                }), 400

            resultado_taxa = DeliveryFeeCalculator.calcular_taxa(distancia_km)
            if resultado_taxa["erro"]:
                return jsonify({
                    "status": "error",
                    "message": resultado_taxa["erro"]
                }), 400
            taxa_entrega = resultado_taxa["taxa"]
        else:
            # Sem distância não há como recalcular. Aceita o que veio, mas nunca
            # negativo — negativo é a única forma de a taxa DIMINUIR o pedido.
            try:
                taxa_entrega = max(0.0, float(dados.get("taxa_entrega") or 0.0))
            except (ValueError, TypeError):
                taxa_entrega = 0.0
    else:
        # Retirada não tem taxa, venha o que vier no corpo da requisição.
        distancia_km = None

    # Calcular valor total (produtos + taxa de entrega)
    valor_total_final = round(valor_total_calculado + taxa_entrega, 2)

    try:
        # Criar Pedido
        novo_pedido = Pedido(
            cliente_id=None,  # Pedido sem usuário autenticado
            nome_cliente=dados.get("nome_cliente"),
            telefone=dados.get("telefone"),
            endereco=dados.get("endereco"),
            numero=dados.get("numero"),
            complemento=dados.get("complemento"),
            cep_entrega=dados.get("cep_entrega"),
            forma_entrega=forma_entrega,
            distancia_km=distancia_km,
            taxa_entrega=taxa_entrega,
            status=StatusPedido.PENDENTE,
            valor_total=valor_total_final,
            observacoes=dados.get("observacoes", ""),
            forma_pagamento=dados.get("forma_pagamento", "dinheiro"),
            troco_para=dados.get("troco_para"),
            data_criacao=datetime.now(ZoneInfo('America/Sao_Paulo'))
        )
        
        db.session.add(novo_pedido)
        db.session.flush()

        # Adicionar itens ao pedido
        for item_info in itens_pedido_info:
            item_pedido = ItemPedido(
                pedido_id=novo_pedido.id,
                esfiha_id=item_info["esfiha_id"],
                quantidade=item_info["quantidade"],
                preco_unitario=item_info["preco_unitario"],
                observacoes=item_info["observacoes"],
                eh_meio_a_meio=item_info.get("eh_meio_a_meio", False),
                esfiha_id_metade2=item_info.get("esfiha_id_metade2"),
                tamanho=item_info.get("tamanho"),
                tipo_massa=item_info.get("tipo_massa")
            )
            db.session.add(item_pedido)
            db.session.flush()  # Para obter o ID do item
            
            # Adicionar acréscimos do item
            for acrescimo_data in item_info.get("acrescimos", []):
                acrescimo_id = acrescimo_data.get("acrescimo_id")
                if acrescimo_id:
                    acrescimo = Acrescimo.query.get(acrescimo_id)
                    if acrescimo:
                        item_acrescimo = ItemPedidoAcrescimo(
                            item_pedido_id=item_pedido.id,
                            acrescimo_id=acrescimo.id,
                            quantidade=acrescimo_data.get("quantidade", 1),
                            preco_unitario=acrescimo.preco
                        )
                        db.session.add(item_acrescimo)

        db.session.commit()
        
        # Gerar link do WhatsApp para enviar pedido à gestão
        pedido_dict = novo_pedido.to_dict()
        resultado_whatsapp_gestao = WhatsAppService.enviar_pedido_para_gestao(pedido_dict)
        
        # Gerar link do WhatsApp para enviar confirmação ao cliente
        resultado_whatsapp_cliente = WhatsAppClienteService.enviar_confirmacao_para_cliente(pedido_dict)
        
        # Adicionar links do WhatsApp na resposta
        if resultado_whatsapp_gestao["sucesso"]:
            pedido_dict["whatsapp_link_gestao"] = resultado_whatsapp_gestao["link"]
        
        if resultado_whatsapp_cliente["sucesso"]:
            pedido_dict["whatsapp_link_cliente"] = resultado_whatsapp_cliente["link"]

        return jsonify({
            "status": "success",
            "message": "Pedido criado com sucesso!",
            "data": pedido_dict,
            "whatsapp_link": resultado_whatsapp_gestao.get("link"),  # Link para gestão (compatibilidade)
            "whatsapp_link_gestao": resultado_whatsapp_gestao.get("link"),
            "whatsapp_link_cliente": resultado_whatsapp_cliente.get("link")
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao criar pedido: {str(e)}"
        }), 500
