from src.models.user import db
from datetime import datetime

class Notificacao(db.Model):
    """
    Modelo para armazenar notificações de mudança de status de pedidos
    """
    __tablename__ = 'notificacao'
    
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Pode ser nulo para clientes não logados
    telefone = db.Column(db.String(20), nullable=False)  # Telefone do cliente para notificação
    status_pedido = db.Column(db.String(30), nullable=False)  # Status que gerou a notificação
    mensagem = db.Column(db.Text, nullable=False)  # Mensagem da notificação
    lida = db.Column(db.Boolean, default=False, nullable=False)  # Se a notificação foi lida
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    data_leitura = db.Column(db.DateTime, nullable=True)  # Quando foi lida
    
    # Relacionamentos
    pedido = db.relationship('Pedido', backref='notificacoes')
    cliente = db.relationship('User', backref='notificacoes')
    
    def __repr__(self):
        return f'<Notificacao {self.id} - Pedido {self.pedido_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'pedido_id': self.pedido_id,
            'cliente_id': self.cliente_id,
            'telefone': self.telefone,
            'status_pedido': self.status_pedido,
            'mensagem': self.mensagem,
            'lida': self.lida,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_leitura': self.data_leitura.isoformat() if self.data_leitura else None
        }
    
    def marcar_como_lida(self):
        """Marca a notificação como lida"""
        self.lida = True
        self.data_leitura = datetime.utcnow()
        db.session.commit()
