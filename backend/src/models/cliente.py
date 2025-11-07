from datetime import datetime
from src.models.user import db

class Cliente(db.Model):
    """Modelo de Cliente para gestão de clientes da esfiharia"""
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    endereco = db.Column(db.String(200), nullable=True)
    bairro = db.Column(db.String(100), nullable=True)
    cidade = db.Column(db.String(100), nullable=True)
    observacoes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Cliente {self.nome}>'
    
    def to_dict(self):
        """Retorna representação em dicionário do cliente"""
        return {
            'id': self.id,
            'nome': self.nome,
            'telefone': self.telefone,
            'email': self.email,
            'endereco': self.endereco,
            'bairro': self.bairro,
            'cidade': self.cidade,
            'observacoes': self.observacoes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
