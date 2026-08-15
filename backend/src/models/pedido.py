
from src.models.user import db
from src.models.esfiha import Esfiha
from src.models.acrescimo import Acrescimo
from datetime import datetime

class StatusPedido:
    PAGAMENTO_PENDENTE = 'pagamento_pendente' # Novo status inicial
    PENDENTE = 'pendente' # Mantido para fluxo pós-pagamento
    APROVADO = 'aprovado'
    RECUSADO = 'recusado'
    EM_PREPARACAO = 'em_preparacao'
    A_CAMINHO = 'a_caminho'
    PRONTO_RETIRADA = 'pronto_retirada'
    ENTREGUE = 'entregue'
    CANCELADO = 'cancelado'
    FALHA_PAGAMENTO = 'falha_pagamento' # Novo status

class ItemPedidoAcrescimo(db.Model):
    """
    Relacionamento entre itens do pedido e acréscimos
    """
    __tablename__ = 'item_pedido_acrescimo'
    
    id = db.Column(db.Integer, primary_key=True)
    item_pedido_id = db.Column(db.Integer, db.ForeignKey('item_pedido.id'), nullable=False)
    acrescimo_id = db.Column(db.Integer, db.ForeignKey('acrescimo.id'), nullable=False)
    quantidade = db.Column(db.Integer, default=1, nullable=False)
    preco_unitario = db.Column(db.Float, nullable=False)  # Preço do acréscimo no momento do pedido
    
    # Relacionamentos
    acrescimo = db.relationship('Acrescimo', backref='itens_pedido')
    
    def __repr__(self):
        return f'<ItemPedidoAcrescimo {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'acrescimo_id': self.acrescimo_id,
            'acrescimo_nome': self.acrescimo.nome if self.acrescimo else None,
            'quantidade': self.quantidade,
            'preco_unitario': self.preco_unitario,
            'subtotal': self.quantidade * self.preco_unitario
        }

class ItemPedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    esfiha_id = db.Column(db.Integer, db.ForeignKey('esfiha.id'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    preco_unitario = db.Column(db.Float, nullable=False)
    observacoes = db.Column(db.Text, nullable=True)
    
    # Campos para pizza meio a meio
    eh_meio_a_meio = db.Column(db.Boolean, default=False, nullable=False)
    esfiha_id_metade2 = db.Column(db.Integer, db.ForeignKey('esfiha.id'), nullable=True)
    tamanho = db.Column(db.String(20), nullable=True)  # broto, media, grande
    tipo_massa = db.Column(db.String(20), nullable=True)  # aberta, fechada (para esfihas)

    esfiha = db.relationship('Esfiha', foreign_keys=[esfiha_id], backref='itens_pedido')
    esfiha_metade2 = db.relationship('Esfiha', foreign_keys=[esfiha_id_metade2])
    acrescimos = db.relationship('ItemPedidoAcrescimo', backref='item_pedido', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<ItemPedido {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'pedido_id': self.pedido_id,
            'esfiha_id': self.esfiha_id,
            'esfiha': self.esfiha.nome if self.esfiha else None,
            'quantidade': self.quantidade,
            'preco_unitario': self.preco_unitario,
            # Inclui os acrescimos, que ESTAO no valor cobrado.
            #
            # Sem eles, um item de 3 pizzas com bacon aparecia como R$ 90,00
            # enquanto o pedido era cobrado a R$ 95,00: a soma dos itens na tela
            # do admin e no cupom nao fechava com o total, e a diferenca parecia
            # erro de cobranca. O numero certo ja existia em
            # calcular_total_com_acrescimos() — faltava usa-lo aqui.
            'subtotal': self.calcular_total_com_acrescimos(),
            'subtotal_sem_acrescimos': round(self.quantidade * self.preco_unitario, 2),
            'observacoes': self.observacoes,
            'acrescimos': [a.to_dict() for a in self.acrescimos] if self.acrescimos else [],
            'eh_meio_a_meio': self.eh_meio_a_meio,
            'esfiha_id_metade2': self.esfiha_id_metade2,
            'esfiha_metade2': self.esfiha_metade2.nome if self.esfiha_metade2 else None,
            'tamanho': self.tamanho,
            'tipo_massa': self.tipo_massa
        }
    
    def calcular_total_com_acrescimos(self):
        """
        Total do item, acréscimos incluídos — pela mesma regra que o cliente vê
        na tela: o acréscimo acompanha CADA unidade.

        Antes o acréscimo entrava uma vez por linha, e por isso um item de 3
        pizzas com bacon fechava R$ 95,00 aqui enquanto o cardápio mostrava
        R$ 105,00 ao cliente (EsfihaModal.js: `(basePrice + extrasPrice) *
        quantity`).

        Efeito nos pedidos ANTIGOS: os que têm quantidade > 1 com acréscimo
        foram cobrados pela regra velha, e agora exibem um subtotal maior que o
        `valor_total` gravado. A diferença não é erro de conta desta função — é
        o quanto aquele pedido deixou de ser cobrado na época.
        """
        acrescimos_por_unidade = 0
        if self.acrescimos:
            for acrescimo in self.acrescimos:
                acrescimos_por_unidade += acrescimo.quantidade * acrescimo.preco_unitario
        return round(self.quantidade * (self.preco_unitario + acrescimos_por_unidade), 2)

class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Pode ser nulo para clientes não logados
    nome_cliente = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    endereco = db.Column(db.Text, nullable=True)
    numero = db.Column(db.String(20), nullable=True)  # Número da residência
    complemento = db.Column(db.String(200), nullable=True)  # Complemento do endereço
    cep_entrega = db.Column(db.String(10), nullable=True)  # CEP do endereço de entrega
    forma_entrega = db.Column(db.String(20), nullable=False)  # retirada ou entrega
    distancia_km = db.Column(db.Float, nullable=True)  # Distância em km (apenas para entregas)
    taxa_entrega = db.Column(db.Float, default=0.0, nullable=False)  # Taxa de entrega calculada
    status = db.Column(db.String(30), default=StatusPedido.PAGAMENTO_PENDENTE, nullable=False) # Status inicial alterado
    valor_total = db.Column(db.Float, nullable=False)
    observacoes = db.Column(db.Text, nullable=True)
    forma_pagamento = db.Column(db.String(20), default='dinheiro', nullable=True)  # dinheiro, cartao, pix
    troco_para = db.Column(db.Float, nullable=True)  # Valor para o qual o cliente precisa de troco
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # stripe_payment_intent_id removido - Sistema usa pagamento na entrega

    cliente = db.relationship('User', backref='pedidos')
    itens = db.relationship('ItemPedido', backref='pedido', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Pedido {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'nome_cliente': self.nome_cliente,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'numero': self.numero,
            'complemento': self.complemento,
            'cep_entrega': self.cep_entrega,
            'forma_entrega': self.forma_entrega,
            'distancia_km': self.distancia_km,
            'taxa_entrega': self.taxa_entrega,
            'status': self.status,
            'valor_total': self.valor_total,
            'observacoes': self.observacoes,
            'forma_pagamento': self.forma_pagamento,
            'troco_para': self.troco_para,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None,
            # stripe_payment_intent_id removido
            'itens': [item.to_dict() for item in self.itens]
        }

    def pode_cancelar(self):
        """Verifica se o pedido ainda pode ser cancelado pelo cliente ou admin"""
        return self.status in [StatusPedido.PENDENTE, StatusPedido.APROVADO]
