from src.models.user import db
from datetime import datetime

class Esfiha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    preco = db.Column(db.Float, nullable=False)
    preco_grande = db.Column(db.Float, nullable=True)  # Para pizzas com tamanhos
    preco_media = db.Column(db.Float, nullable=True)   # Para pizzas com tamanhos
    preco_broto = db.Column(db.Float, nullable=True)   # Para pizzas com tamanhos
    categoria = db.Column(db.String(50), nullable=True)
    disponivel = db.Column(db.Boolean, default=True)
    imagem_url = db.Column(db.String(255), nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Esfiha {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'preco': self.preco,
            'preco_grande': self.preco_grande,
            'preco_media': self.preco_media,
            'preco_broto': self.preco_broto,
            'categoria': self.categoria,
            'disponivel': self.disponivel,
            'imagem_url': self.imagem_url,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }
