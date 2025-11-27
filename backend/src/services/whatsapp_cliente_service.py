"""
Serviço de integração com WhatsApp Web API para enviar confirmações aos clientes
"""
import urllib.parse
from datetime import datetime
from zoneinfo import ZoneInfo


class WhatsAppClienteService:
    """Serviço para enviar mensagens de confirmação aos clientes via WhatsApp"""
    
    @staticmethod
    def formatar_telefone_internacional(telefone):
        """
        Formata o telefone para o padrão internacional (sem +)
        
        Args:
            telefone: String com telefone (pode ter formatação)
            
        Returns:
            str: Telefone no formato internacional (ex: 5511987654321)
        """
        # Remove todos os caracteres não numéricos
        apenas_numeros = ''.join(filter(str.isdigit, telefone))
        
        # Se já tiver código do país, retorna
        if len(apenas_numeros) == 13 and apenas_numeros.startswith('55'):
            return apenas_numeros
        
        # Se tiver 11 dígitos (DDD + número), adiciona código do Brasil
        if len(apenas_numeros) == 11:
            return f'55{apenas_numeros}'
        
        # Se tiver 10 dígitos (DDD + número sem 9), adiciona 55 e o 9
        if len(apenas_numeros) == 10:
            ddd = apenas_numeros[:2]
            numero = apenas_numeros[2:]
            return f'55{ddd}9{numero}'
        
        # Retorna como está se não conseguir formatar
        return apenas_numeros
    
    @staticmethod
    def formatar_mensagem_confirmacao(pedido_data):
        """
        Formata mensagem de confirmação do pedido para o cliente
        
        Args:
            pedido_data: Dicionário com os dados do pedido
            
        Returns:
            str: Mensagem formatada
        """
        pedido_id = pedido_data.get('id', 'N/A')
        nome_cliente = pedido_data.get('nome_cliente', 'Cliente')
        forma_entrega = pedido_data.get('forma_entrega', 'retirada')
        valor_total = pedido_data.get('valor_total', 0)
        taxa_entrega = pedido_data.get('taxa_entrega', 0)
        forma_pagamento = pedido_data.get('forma_pagamento', 'dinheiro')
        
        # Saudação personalizada
        mensagem = f"""✅ *PEDIDO CONFIRMADO!*

Olá *{nome_cliente}*! 👋

Seu pedido *#{pedido_id}* foi recebido com sucesso! 🎉"""
        
        # Tipo de entrega
        if forma_entrega == "entrega":
            mensagem += "\n\n🏠 *DELIVERY*"
            mensagem += "\nSeu pedido será entregue no endereço informado."
        else:
            mensagem += "\n\n🏪 *RETIRADA NO LOCAL*"
            mensagem += "\nVocê escolheu retirar no restaurante."
        
        # Itens do pedido
        mensagem += "\n\n📦 *SEUS ITENS:*"
        itens = pedido_data.get('itens', [])
        for item in itens:
            nome_item = item.get('esfiha', item.get('esfiha_nome', 'Item'))
            qtd = item.get('quantidade', 1)
            mensagem += f"\n• {qtd}x {nome_item}"
            
            # Adicionar acréscimos (recheios, bordas, etc.) se houver
            acrescimos = item.get('acrescimos', [])
            if acrescimos:
                for acrescimo in acrescimos:
                    nome_acrescimo = acrescimo.get('acrescimo_nome', 'Acréscimo')
                    mensagem += f"\n    + {nome_acrescimo}"
        
        # Valores
        mensagem += "\n\n💰 *VALOR TOTAL:*"
        valor_produtos = valor_total - taxa_entrega
        
        if taxa_entrega > 0:
            mensagem += f"\nProdutos: R$ {valor_produtos:.2f}"
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
        
        # Tempo estimado
        if forma_entrega == "entrega":
            mensagem += "\n\n⏱️ *Tempo estimado:* 40-60 minutos"
        else:
            mensagem += "\n\n⏱️ *Tempo estimado:* 30-40 minutos"
        
        # Instruções finais
        mensagem += "\n\n📱 *Acompanhe seu pedido:*"
        mensagem += "\nAcesse nosso site para ver o status em tempo real!"
        
        mensagem += "\n\n🙏 *Obrigado pela preferência!*"
        mensagem += "\n_Jamal Esfiharia - Esfihas Tradicionais_"
        
        return mensagem
    
    @staticmethod
    def gerar_link_whatsapp_cliente(telefone, mensagem):
        """
        Gera o link do WhatsApp Web para enviar mensagem ao cliente
        
        Args:
            telefone: Telefone do cliente
            mensagem: Texto da mensagem
            
        Returns:
            str: URL completa do WhatsApp Web
        """
        telefone_formatado = WhatsAppClienteService.formatar_telefone_internacional(telefone)
        mensagem_encoded = urllib.parse.quote(mensagem)
        link = f"https://api.whatsapp.com/send?phone={telefone_formatado}&text={mensagem_encoded}"
        return link
    
    @staticmethod
    def enviar_confirmacao_para_cliente(pedido_data):
        """
        Prepara e retorna o link para enviar confirmação ao cliente via WhatsApp
        
        Args:
            pedido_data: Dicionário com os dados do pedido
            
        Returns:
            dict: Dicionário com status e link do WhatsApp
        """
        try:
            telefone = pedido_data.get('telefone')
            
            if not telefone:
                return {
                    "sucesso": False,
                    "erro": "Telefone do cliente não informado",
                    "link": None
                }
            
            mensagem = WhatsAppClienteService.formatar_mensagem_confirmacao(pedido_data)
            link = WhatsAppClienteService.gerar_link_whatsapp_cliente(telefone, mensagem)
            
            return {
                "sucesso": True,
                "link": link,
                "mensagem": mensagem,
                "telefone": telefone
            }
        except Exception as e:
            return {
                "sucesso": False,
                "erro": str(e),
                "link": None
            }
