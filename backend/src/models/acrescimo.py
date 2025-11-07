from src.models.user import db
from datetime import datetime

class Acrescimo(db.Model):
    """
    Modelo para acréscimos/adicionais de produtos
    """
    __tablename__ = 'acrescimo'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # 'esfiha', 'pizza_metade', 'pizza_toda', 'borda'
    preco = db.Column(db.Float, nullable=False)
    disponivel = db.Column(db.Boolean, default=True)
    ordem = db.Column(db.Integer, default=0)  # Para ordenação na interface
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Acrescimo {self.nome} ({self.tipo})>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'tipo': self.tipo,
            'preco': self.preco,
            'disponivel': self.disponivel,
            'ordem': self.ordem,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }
