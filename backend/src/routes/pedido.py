import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User
from src.models.pedido import Pedido, ItemPedido, ItemPedidoAcrescimo, StatusPedido
from src.models.acrescimo import Acrescimo
from src.models.pedido_historico import PedidoHistorico
from src.models.esfiha import Esfiha
from src.middleware.auth import admin_required
from src.services.delivery_fee import DeliveryFeeCalculator
from src.services.google_maps import GoogleMapsService
from src.services.notificacao_service import NotificacaoService
from src.services.whatsapp_service import WhatsAppService
from datetime import datetime
from zoneinfo import ZoneInfo

pedido_bp = Blueprint("pedido", __name__)

# Stripe removido - Pagamento na entrega com motoboy


# ==============================
# ROTAS PARA O USUÁRIO
# ==============================

@pedido_bp.route("/me", methods=["GET"])
@jwt_required()
def listar_meus_pedidos():
    """Lista os pedidos do usuário logado."""
    current_user_id = get_jwt_identity()
    
    # Parâmetros de paginação
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Filtro por status
    status_filter = request.args.get('status', None)
    
    query = Pedido.query.filter_by(cliente_id=current_user_id)
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    pagination = query.order_by(Pedido.data_criacao.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    pedidos_list = [pedido.to_dict() for pedido in pagination.items]
    return jsonify({
        "status": "success",
        "pedidos": pedidos_list,
        "data": pedidos_list,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }), 200


@pedido_bp.route("/me/<int:id>", methods=["GET"])
@jwt_required()
def obter_meu_pedido(id):
    """Obtém um pedido específico do usuário logado."""
    current_user_id = get_jwt_identity()
    pedido = Pedido.query.filter_by(id=id, cliente_id=current_user_id).first()
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404
    
    return jsonify({
        "status": "success",
        "data": pedido.to_dict()
    }), 200


@pedido_bp.route("/me/cancelar/<int:id>", methods=["PATCH"])
@jwt_required()
def cancelar_meu_pedido(id):
    """Cancela um pedido do usuário logado (se permitido)."""
    current_user_id = get_jwt_identity()
    pedido = Pedido.query.filter_by(id=id, cliente_id=current_user_id).first()
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404

    if not pedido.pode_cancelar():
        return jsonify({
            "status": "error",
            "message": "Este pedido não pode mais ser cancelado."
        }), 400

    # Cancelar pedido (sem integração de pagamento online)
    pedido.status = StatusPedido.CANCELADO
    pedido.data_atualizacao = datetime.now(ZoneInfo('America/Sao_Paulo'))
    
    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Pedido cancelado com sucesso.",
            "data": pedido.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao cancelar pedido: {str(e)}"
        }), 500


@pedido_bp.route("/criar", methods=["POST"])
@jwt_required(optional=True)
def criar_pedido():
    """Cria um pedido para pagamento na entrega (sem pagamento online)."""
    dados = request.json
    current_user_id = get_jwt_identity()

    # Validação básica de campos obrigatórios
    required_fields = ["nome_cliente", "telefone", "itens", "forma_entrega"]
    for field in required_fields:
        if not dados.get(field):
            return jsonify({
                "status": "error",
                "message": f"Campo obrigatório ausente: {field}"
            }), 400

    # Validar forma de entrega
    if dados.get("forma_entrega") not in ["retirada", "entrega"]:
        return jsonify({
            "status": "error",
            "message": "Forma de entrega inválida. Use 'retirada' ou 'entrega'."
        }), 400

    # Se for entrega, endereço é obrigatório
    if dados.get("forma_entrega") == "entrega":
        if not dados.get("endereco"):
            return jsonify({
                "status": "error",
                "message": "Endereço é obrigatório para entrega."
            }), 400

    valor_total_calculado = 0
    itens_pedido_info = []

    # Validar itens e calcular total
    for item_data in dados.get("itens", []):
        esfiha_id = item_data.get("esfiha_id")
        quantidade = item_data.get("quantidade", 1)

        if not esfiha_id or not isinstance(quantidade, int) or quantidade <= 0:
            return jsonify({
                "status": "error",
                "message": f"Item inválido: {item_data}"
            }), 400

        esfiha = Esfiha.query.get(esfiha_id)
        if not esfiha:
            return jsonify({
                "status": "error",
                "message": f"Esfiha ID {esfiha_id} não encontrada."
            }), 404
            
        if not esfiha.disponivel:
            return jsonify({
                "status": "error",
                "message": f"Esfiha '{esfiha.nome}' não está disponível no momento."
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
            print(f"\n=== CÁLCULO MEIO A MEIO (PEDIDO COMPLETO) ===")
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
        
        subtotal = (preco_base * quantidade) + total_acrescimos
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
            "tipo_massa": item_data.get("tipo_massa")  # Capturar tipo de massa do frontend
        })

    if not itens_pedido_info:
        return jsonify({
            "status": "error",
            "message": "O pedido deve conter pelo menos um item."
        }), 400

    # Calcular taxa de entrega se for entrega
    taxa_entrega = 0.0
    distancia_km = None
    duracao_estimada = None
    
    if dados.get("forma_entrega") == "entrega":
        # Se distância foi fornecida manualmente, usar ela
        if dados.get("distancia_km"):
            try:
                distancia_km = float(dados.get("distancia_km"))
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "message": "Distância inválida. Deve ser um número."
                }), 400
        else:
            # Calcular distância automaticamente usando Google Maps
            endereco_cliente = dados.get("endereco")
            resultado_maps = GoogleMapsService.calcular_distancia(endereco_cliente)
            
            if resultado_maps["erro"]:
                return jsonify({
                    "status": "error",
                    "message": f"Erro ao calcular distância: {resultado_maps['erro']}"
                }), 400
            
            distancia_km = resultado_maps["distancia_km"]
            duracao_estimada = resultado_maps["duracao_texto"]
        
        # Calcular taxa baseada na distância
        resultado_taxa = DeliveryFeeCalculator.calcular_taxa(distancia_km)
        
        if resultado_taxa["erro"]:
            return jsonify({
                "status": "error",
                "message": resultado_taxa["erro"]
            }), 400
        
        taxa_entrega = resultado_taxa["taxa"]
    
    # Calcular valor total (produtos + taxa de entrega)
    valor_total_final = round(valor_total_calculado + taxa_entrega, 2)

    # Criar Pedido
    novo_pedido = Pedido(
        cliente_id=current_user_id,
        nome_cliente=dados.get("nome_cliente"),
        telefone=dados.get("telefone"),
        endereco=dados.get("endereco"),
        numero=dados.get("numero"),
        complemento=dados.get("complemento"),
        cep_entrega=dados.get("cep_entrega"),
        forma_entrega=dados.get("forma_entrega"),
        distancia_km=distancia_km,
        taxa_entrega=taxa_entrega,
        status=StatusPedido.PENDENTE,
        valor_total=valor_total_final,
        observacoes=dados.get("observacoes", ""),
        forma_pagamento=dados.get("forma_pagamento", "dinheiro"),
        troco_para=dados.get("troco_para")
    )
    db.session.add(novo_pedido)
    db.session.flush()

    # Adicionar itens ao pedido
    for item_info in itens_pedido_info:
        novo_item = ItemPedido(
            pedido_id=novo_pedido.id,
            esfiha_id=item_info["esfiha_id"],
            quantidade=item_info["quantidade"],
            preco_unitario=item_info["preco_unitario"],
            observacoes=item_info["observacoes"],
            eh_meio_a_meio=item_info.get("eh_meio_a_meio", False),
            esfiha_id_metade2=item_info.get("esfiha_id_metade2"),
            tamanho=item_info.get("tamanho"),
            tipo_massa=item_info.get("tipo_massa")  # Salvar tipo de massa (aberta/fechada)
        )
        db.session.add(novo_item)
        db.session.flush()  # Para obter o ID do item
        
        # Adicionar acréscimos do item
        for acrescimo_data in item_info.get("acrescimos", []):
            acrescimo_id = acrescimo_data.get("acrescimo_id")
            if acrescimo_id:
                acrescimo = Acrescimo.query.get(acrescimo_id)
                if acrescimo:
                    item_acrescimo = ItemPedidoAcrescimo(
                        item_pedido_id=novo_item.id,
                        acrescimo_id=acrescimo.id,
                        quantidade=acrescimo_data.get("quantidade", 1),
                        preco_unitario=acrescimo.preco
                    )
                    db.session.add(item_acrescimo)

    try:
        db.session.commit()
        
        # Gerar link do WhatsApp para enviar pedido à gestão
        pedido_dict = novo_pedido.to_dict()
        resultado_whatsapp = WhatsAppService.enviar_pedido_para_gestao(pedido_dict)
        
        # Adicionar link do WhatsApp na resposta
        if resultado_whatsapp["sucesso"]:
            pedido_dict["whatsapp_link"] = resultado_whatsapp["link"]

        return jsonify({
            "status": "success",
            "message": "Pedido criado com sucesso! Pagamento na entrega.",
            "data": pedido_dict,
            "whatsapp_link": resultado_whatsapp.get("link")
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao criar pedido: {str(e)}"
        }), 500


# Webhook do Stripe removido - Sistema usa pagamento na entrega


# ==============================
# ROTAS PARA ADMIN
# ==============================

@pedido_bp.route("/admin", methods=["GET"])
@admin_required
def listar_todos_pedidos_admin():
    """Lista todos os pedidos com filtros e paginação (Admin)."""
    # Parâmetros de paginação
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filtros
    status_filter = request.args.get('status', None)
    cliente_id_filter = request.args.get('cliente_id', None, type=int)
    forma_entrega_filter = request.args.get('forma_entrega', None)
    data_inicio = request.args.get('data_inicio', None)
    data_fim = request.args.get('data_fim', None)
    search = request.args.get('search', None)
    
    query = Pedido.query
    
    # Aplicar filtros
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    if cliente_id_filter:
        query = query.filter_by(cliente_id=cliente_id_filter)
    
    if forma_entrega_filter:
        query = query.filter_by(forma_entrega=forma_entrega_filter)
    
    if data_inicio:
        try:
            data_inicio_dt = datetime.fromisoformat(data_inicio)
            query = query.filter(Pedido.data_criacao >= data_inicio_dt)
        except ValueError:
            pass
    
    if data_fim:
        try:
            data_fim_dt = datetime.fromisoformat(data_fim)
            query = query.filter(Pedido.data_criacao <= data_fim_dt)
        except ValueError:
            pass
    
    if search:
        query = query.filter(
            (Pedido.nome_cliente.contains(search)) |
            (Pedido.telefone.contains(search)) |
            (Pedido.id == int(search) if search.isdigit() else False)
        )
    
    # Paginação
    pagination = query.order_by(Pedido.data_criacao.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    pedidos_list = [pedido.to_dict() for pedido in pagination.items]
    return jsonify({
        "status": "success",
        "pedidos": pedidos_list,
        "data": pedidos_list,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }), 200


@pedido_bp.route("/admin/<int:pedido_id>", methods=["GET"])
@admin_required
def obter_pedido_admin(pedido_id):
    """Obtém um pedido específico pelo ID (Admin)."""
    pedido = Pedido.query.get(pedido_id)
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404
    
    return jsonify({
        "status": "success",
        "data": pedido.to_dict()
    }), 200


@pedido_bp.route("/admin/<int:pedido_id>/status", methods=["PUT"])
@admin_required
def atualizar_status_admin(pedido_id):
    """Atualiza o status de um pedido (Admin)."""
    pedido = Pedido.query.get(pedido_id)
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404
    
    dados = request.json

    if "status" not in dados:
        return jsonify({
            "status": "error",
            "message": "Status não fornecido."
        }), 400

    novo_status = dados["status"]
    status_validos = [
        StatusPedido.PENDENTE, 
        StatusPedido.APROVADO, 
        StatusPedido.RECUSADO,
        StatusPedido.EM_PREPARACAO, 
        StatusPedido.A_CAMINHO, 
        StatusPedido.PRONTO_RETIRADA,
        StatusPedido.ENTREGUE, 
        StatusPedido.CANCELADO, 
        StatusPedido.FALHA_PAGAMENTO,
        StatusPedido.PAGAMENTO_PENDENTE
    ]

    if novo_status not in status_validos:
        return jsonify({
            "status": "error",
            "message": f"Status inválido. Status válidos: {', '.join(status_validos)}"
        }), 400

    # Registrar histórico de mudança de status
    status_anterior = pedido.status
    pedido.status = novo_status
    pedido.data_atualizacao = datetime.now(ZoneInfo('America/Sao_Paulo'))
    
    # Obter ID do usuário que está fazendo a mudança
    current_user_id = get_jwt_identity()
    
    # Criar registro de histórico
    historico = PedidoHistorico(
        pedido_id=pedido.id,
        status_anterior=status_anterior,
        status_novo=novo_status,
        usuario_id=current_user_id,
        observacao=dados.get('observacao')
    )
    db.session.add(historico)
    
    try:
        db.session.commit()
        
        # Criar notificação para o cliente se o status for notificável
        notificacao = NotificacaoService.criar_notificacao(pedido, novo_status)
        
        response_data = pedido.to_dict()
        if notificacao:
            response_data['notificacao_criada'] = True
            response_data['notificacao'] = notificacao.to_dict()
        
        return jsonify({
            "status": "success",
            "message": "Status do pedido atualizado com sucesso.",
            "data": response_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao atualizar status: {str(e)}"
        }), 500


@pedido_bp.route("/admin/<int:pedido_id>", methods=["DELETE"])
@admin_required
def deletar_pedido_admin(pedido_id):
    """Deleta um pedido (Admin) - use com cautela."""
    pedido = Pedido.query.get(pedido_id)
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404
    
    try:
        db.session.delete(pedido)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Pedido deletado com sucesso."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao deletar pedido: {str(e)}"
        }), 500


@pedido_bp.route("/admin/estatisticas", methods=["GET"])
@admin_required
def obter_estatisticas_admin():
    """Retorna estatísticas gerais dos pedidos (Admin)."""
    try:
        total_pedidos = Pedido.query.count()
        pedidos_pendentes = Pedido.query.filter_by(status=StatusPedido.PENDENTE).count()
        pedidos_em_preparacao = Pedido.query.filter_by(status=StatusPedido.EM_PREPARACAO).count()
        pedidos_entregues = Pedido.query.filter_by(status=StatusPedido.ENTREGUE).count()
        pedidos_cancelados = Pedido.query.filter_by(status=StatusPedido.CANCELADO).count()
        
        # Calcular valor total de pedidos entregues
        valor_total_entregues = db.session.query(
            db.func.sum(Pedido.valor_total)
        ).filter_by(status=StatusPedido.ENTREGUE).scalar() or 0
        
        return jsonify({
            "status": "success",
            "data": {
                "total_pedidos": total_pedidos,
                "pedidos_pendentes": pedidos_pendentes,
                "pedidos_em_preparacao": pedidos_em_preparacao,
                "pedidos_entregues": pedidos_entregues,
                "pedidos_cancelados": pedidos_cancelados,
                "valor_total_entregues": round(valor_total_entregues, 2)
            }
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro ao obter estatísticas: {str(e)}"
        }), 500


@pedido_bp.route("/<int:pedido_id>/", methods=["GET"])
@admin_required
def obter_pedido_para_impressao(pedido_id):
    """Obtém dados completos de um pedido para impressão (Admin)."""
    try:
        pedido = Pedido.query.get(pedido_id)
        
        if not pedido:
            return jsonify({
                "success": False,
                "status": "error",
                "message": "Pedido não encontrado."
            }), 404
        
        return jsonify({
            "success": True,
            "status": "success",
            "data": pedido.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "error",
            "message": f"Erro ao buscar pedido: {str(e)}"
        }), 500


@pedido_bp.route("/<int:pedido_id>/historico", methods=["GET"])
@admin_required
def obter_historico_pedido(pedido_id):
    """Retorna o histórico de mudanças de status de um pedido (Admin)."""
    pedido = Pedido.query.get(pedido_id)
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404
    
    try:
        # Buscar histórico ordenado por data (mais recente primeiro)
        historico = PedidoHistorico.query.filter_by(pedido_id=pedido_id).order_by(
            PedidoHistorico.data_mudanca.desc()
        ).all()
        
        historico_list = []
        for h in historico:
            item = {
                'id': h.id,
                'status': h.status_novo,
                'status_anterior': h.status_anterior,
                'data_mudanca': h.data_mudanca.isoformat() if h.data_mudanca else None,
                'usuario': h.usuario.username if h.usuario else 'Sistema',
                'observacao': h.observacao
            }
            historico_list.append(item)
        
        return jsonify({
            "status": "success",
            "data": historico_list,
            "historico": historico_list
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro ao buscar histórico: {str(e)}"
        }), 500


@pedido_bp.route("/<int:pedido_id>/historico-publico", methods=["GET"])
def obter_historico_pedido_publico(pedido_id):
    """Retorna o histórico de mudanças de status de um pedido (Público - sem autenticação)."""
    pedido = Pedido.query.get(pedido_id)
    
    if not pedido:
        return jsonify({
            "status": "error",
            "message": "Pedido não encontrado."
        }), 404
    
    try:
        # Buscar histórico ordenado por data (mais recente primeiro)
        historico = PedidoHistorico.query.filter_by(pedido_id=pedido_id).order_by(
            PedidoHistorico.data_mudanca.desc()
        ).all()
        
        historico_list = []
        for h in historico:
            item = {
                'id': h.id,
                'status': h.status_novo,
                'status_anterior': h.status_anterior,
                'data_mudanca': h.data_mudanca.isoformat() if h.data_mudanca else None,
                'observacao': h.observacao
            }
            historico_list.append(item)
        
        return jsonify({
            "status": "success",
            "data": historico_list,
            "historico": historico_list
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro ao buscar histórico: {str(e)}"
        }), 500
