from src.models.user import db
from src.models.notificacao import Notificacao
from src.models.pedido import StatusPedido
from datetime import datetime

class NotificacaoService:
    """
    Serviço para gerenciar notificações de pedidos
    """
    
    # Status que devem gerar notificações
    STATUS_NOTIFICAVEIS = [
        StatusPedido.APROVADO,
        StatusPedido.EM_PREPARACAO,
        StatusPedido.PRONTO_RETIRADA,
        StatusPedido.A_CAMINHO
    ]
    
    @staticmethod
    def criar_notificacao(pedido, novo_status):
        """
        Cria uma notificação quando o status do pedido muda
        
        Args:
            pedido: Objeto Pedido
            novo_status: Novo status do pedido
            
        Returns:
            Notificacao ou None se o status não for notificável
        """
        # Verificar se o status deve gerar notificação
        if novo_status not in NotificacaoService.STATUS_NOTIFICAVEIS:
            return None
        
        # Gerar mensagem personalizada baseada no status
        mensagem = NotificacaoService._gerar_mensagem(pedido, novo_status)
        
        # Criar notificação
        notificacao = Notificacao(
            pedido_id=pedido.id,
            cliente_id=pedido.cliente_id,
            telefone=pedido.telefone,
            status_pedido=novo_status,
            mensagem=mensagem,
            lida=False
        )
        
        db.session.add(notificacao)
        db.session.commit()
        
        return notificacao
    
    @staticmethod
    def _gerar_mensagem(pedido, status):
        """
        Gera mensagem personalizada baseada no status
        
        Args:
            pedido: Objeto Pedido
            status: Status do pedido
            
        Returns:
            String com a mensagem
        """
        mensagens = {
            StatusPedido.APROVADO: (
                f"✅ Pedido #{pedido.id} confirmado! "
                f"Seu pedido foi aprovado e já está sendo preparado. "
                f"Valor total: R$ {pedido.valor_total:.2f}"
            ),
            StatusPedido.EM_PREPARACAO: (
                f"👨‍🍳 Pedido #{pedido.id} em preparo! "
                f"Estamos preparando seu pedido com muito carinho. "
                f"Em breve estará pronto!"
            ),
            StatusPedido.PRONTO_RETIRADA: (
                f"✨ Pedido #{pedido.id} pronto! "
                f"Seu pedido está pronto para {'retirada' if pedido.forma_entrega == 'retirada' else 'entrega'}. "
                f"{'Você já pode vir buscar!' if pedido.forma_entrega == 'retirada' else 'O entregador sairá em breve!'}"
            ),
            StatusPedido.A_CAMINHO: (
                f"🛵 Pedido #{pedido.id} a caminho! "
                f"Seu pedido saiu para entrega. "
                f"Endereço: {pedido.endereco}. "
                f"Em breve chegará!"
            )
        }
        
        return mensagens.get(status, f"Status do pedido #{pedido.id} atualizado para: {status}")
    
    @staticmethod
    def buscar_notificacoes_cliente(cliente_id=None, telefone=None, apenas_nao_lidas=False):
        """
        Busca notificações de um cliente
        
        Args:
            cliente_id: ID do cliente (opcional)
            telefone: Telefone do cliente (opcional)
            apenas_nao_lidas: Se True, retorna apenas notificações não lidas
            
        Returns:
            Lista de notificações
        """
        query = Notificacao.query
        
        if cliente_id:
            query = query.filter_by(cliente_id=cliente_id)
        elif telefone:
            query = query.filter_by(telefone=telefone)
        else:
            return []
        
        if apenas_nao_lidas:
            query = query.filter_by(lida=False)
        
        return query.order_by(Notificacao.data_criacao.desc()).all()
    
    @staticmethod
    def marcar_como_lida(notificacao_id):
        """
        Marca uma notificação como lida
        
        Args:
            notificacao_id: ID da notificação
            
        Returns:
            True se sucesso, False se não encontrada
        """
        notificacao = Notificacao.query.get(notificacao_id)
        
        if not notificacao:
            return False
        
        notificacao.marcar_como_lida()
        return True
    
    @staticmethod
    def marcar_todas_como_lidas(cliente_id=None, telefone=None):
        """
        Marca todas as notificações de um cliente como lidas
        
        Args:
            cliente_id: ID do cliente (opcional)
            telefone: Telefone do cliente (opcional)
            
        Returns:
            Número de notificações marcadas como lidas
        """
        query = Notificacao.query.filter_by(lida=False)
        
        if cliente_id:
            query = query.filter_by(cliente_id=cliente_id)
        elif telefone:
            query = query.filter_by(telefone=telefone)
        else:
            return 0
        
        notificacoes = query.all()
        count = 0
        
        for notificacao in notificacoes:
            notificacao.marcar_como_lida()
            count += 1
        
        return count
