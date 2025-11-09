"""
Serviço de integração com WhatsApp Web API
Envia notificações de pedidos para a gestão
"""
import urllib.parse
from datetime import datetime
from zoneinfo import ZoneInfo


class WhatsAppService:
    """Serviço para enviar mensagens via WhatsApp Web API"""
    
    # Número da gestão (formato internacional sem +)
    GESTAO_PHONE = "5511933331106"
    
    @staticmethod
    def formatar_mensagem_pedido(pedido_data):
        """
        Formata os dados do pedido em uma mensagem para WhatsApp
        
        Args:
            pedido_data: Dicionário com os dados do pedido
            
        Returns:
            str: Mensagem formatada
        """
        pedido_id = pedido_data.get('id', 'N/A')
        nome_cliente = pedido_data.get('nome_cliente', 'N/A')
        telefone = pedido_data.get('telefone', 'N/A')
        endereco = pedido_data.get('endereco', '')
        complemento = pedido_data.get('complemento', '')
        cep_entrega = pedido_data.get('cep_entrega', '')
        forma_entrega = pedido_data.get('forma_entrega', 'retirada')
        valor_total = pedido_data.get('valor_total', 0)
        taxa_entrega = pedido_data.get('taxa_entrega', 0)
        forma_pagamento = pedido_data.get('forma_pagamento', 'dinheiro')
        troco_para = pedido_data.get('troco_para')
        observacoes = pedido_data.get('observacoes', '')
        
        # Formatar tipo de entrega
        tipo_entrega = "🏠 DELIVERY" if forma_entrega == "entrega" else "🏪 RETIRADA"
        
        # Construir mensagem
        mensagem = f"""🔔 *NOVO PEDIDO #{pedido_id}*

👤 *Cliente:* {nome_cliente}
📱 *Telefone:* {telefone}"""
        
        # Adicionar endereço completo se for delivery
        if forma_entrega == "entrega" and endereco:
            mensagem += f"\n📍 *Endereço:* {endereco}"
            if complemento:
                mensagem += f"\n   *Complemento:* {complemento}"
            if cep_entrega:
                mensagem += f"\n   *CEP:* {cep_entrega}"
        
        mensagem += f"\n\n{tipo_entrega}"
        
        # Listar itens
        mensagem += "\n\n📦 *ITENS:*"
        itens = pedido_data.get('itens', [])
        for item in itens:
            nome_item = item.get('esfiha', item.get('esfiha_nome', 'Item'))
            qtd = item.get('quantidade', 1)
            preco = item.get('preco_unitario', 0)
            subtotal = qtd * preco
            
            mensagem += f"\n• {qtd}x {nome_item} - R$ {subtotal:.2f}"
            
            # Adicionar observações do item se houver
            obs_item = item.get('observacoes', '')
            if obs_item:
                mensagem += f"\n  _{obs_item}_"
        
        # Valores
        mensagem += f"\n\n💰 *VALORES:*"
        valor_produtos = valor_total - taxa_entrega
        mensagem += f"\nProdutos: R$ {valor_produtos:.2f}"
        
        if taxa_entrega > 0:
            mensagem += f"\nTaxa de Entrega: R$ {taxa_entrega:.2f}"
        
        mensagem += f"\n*TOTAL: R$ {valor_total:.2f}*"
        
        # Forma de pagamento
        forma_pag_texto = {
            'dinheiro': '💵 Dinheiro',
            'cartao': '💳 Cartão',
            'pix': '📱 PIX',
            'cartao_debito': '💳 Cartão Débito',
            'cartao_credito': '💳 Cartão Crédito'
        }.get(forma_pagamento, forma_pagamento)
        
        mensagem += f"\n\n💳 *Pagamento:* {forma_pag_texto}"
        
        if forma_pagamento == 'dinheiro' and troco_para:
            mensagem += f"\n💵 Troco para: R$ {troco_para:.2f}"
        
        # Observações gerais
        if observacoes:
            mensagem += f"\n\n📝 *Observações:*\n{observacoes}"
        
        # Data/hora (horário de Brasília)
        data_hora = datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%d/%m/%Y às %H:%M')
        mensagem += f"\n\n🕐 {data_hora}"
        
        return mensagem
    
    @staticmethod
    def gerar_link_whatsapp(mensagem):
        """
        Gera o link do WhatsApp Web com a mensagem pré-formatada
        
        Args:
            mensagem: Texto da mensagem
            
        Returns:
            str: URL completa do WhatsApp Web
        """
        mensagem_encoded = urllib.parse.quote(mensagem)
        link = f"https://api.whatsapp.com/send?phone={WhatsAppService.GESTAO_PHONE}&text={mensagem_encoded}"
        return link
    
    @staticmethod
    def enviar_pedido_para_gestao(pedido_data):
        """
        Prepara e retorna o link para enviar o pedido via WhatsApp
        
        Args:
            pedido_data: Dicionário com os dados do pedido
            
        Returns:
            dict: Dicionário com status e link do WhatsApp
        """
        try:
            mensagem = WhatsAppService.formatar_mensagem_pedido(pedido_data)
            link = WhatsAppService.gerar_link_whatsapp(mensagem)
            
            return {
                "sucesso": True,
                "link": link,
                "mensagem": mensagem
            }
        except Exception as e:
            return {
                "sucesso": False,
                "erro": str(e),
                "link": None
            }
