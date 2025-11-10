"""
Modelo para histórico de mudanças de status de pedidos
"""
from datetime import datetime
from src.models.user import db

class PedidoHistorico(db.Model):
    """Modelo para armazenar histórico de mudanças de status dos pedidos"""
    __tablename__ = 'pedido_historico'
    
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    status_anterior = db.Column(db.String(50))
    status_novo = db.Column(db.String(50), nullable=False)
    data_mudanca = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    observacao = db.Column(db.Text)
    
    # Relacionamentos
    pedido = db.Relationship('Pedido', backref=db.backref('historico', lazy=True, order_by='PedidoHistorico.data_mudanca.desc()'))
    usuario = db.relationship('User', backref=db.backref('mudancas_pedido', lazy=True))
    
    def to_dict(self):
        """Converte o histórico para dicionário"""
        return {
            'id': self.id,
            'pedido_id': self.pedido_id,
            'status_anterior': self.status_anterior,
            'status_novo': self.status_novo,
            'data_mudanca': self.data_mudanca.isoformat() if self.data_mudanca else None,
            'usuario': self.usuario.username if self.usuario else None,
            'observacao': self.observacao
        }
    
    def __repr__(self):
        return f'<PedidoHistorico {self.id}: Pedido {self.pedido_id} - {self.status_anterior} -> {self.status_novo}>'
