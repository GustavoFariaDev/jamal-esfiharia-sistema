from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db
from src.models.cliente import Cliente
from src.middleware.auth import admin_required

cliente_bp = Blueprint('clientes', __name__)

@cliente_bp.route('/', methods=['GET'])
@admin_required
def get_clientes():
    """Lista todos os clientes (Admin)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)
        search = request.args.get('search', '')
        
        query = Cliente.query
        
        # Filtro de busca por nome, telefone ou email
        if search:
            query = query.filter(
                (Cliente.nome.contains(search)) | 
                (Cliente.telefone.contains(search)) |
                (Cliente.email.contains(search))
            )
        
        # Ordenar por data de criação (mais recentes primeiro)
        clientes = query.order_by(Cliente.created_at.desc()).all()
        
        return jsonify({
            'status': 'success',
            'data': [cliente.to_dict() for cliente in clientes]
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao buscar clientes: {str(e)}'
        }), 500


@cliente_bp.route('/', methods=['POST'])
@admin_required
def create_cliente():
    """Cria um novo cliente (Admin)"""
    try:
        data = request.json
        
        # Validação de campos obrigatórios
        if not data.get('nome'):
            return jsonify({
                'status': 'error',
                'message': 'Nome é obrigatório'
            }), 400
            
        if not data.get('telefone'):
            return jsonify({
                'status': 'error',
                'message': 'Telefone é obrigatório'
            }), 400
        
        # Criar novo cliente
        cliente = Cliente(
            nome=data.get('nome'),
            telefone=data.get('telefone'),
            email=data.get('email'),
            endereco=data.get('endereco'),
            bairro=data.get('bairro'),
            cidade=data.get('cidade'),
            observacoes=data.get('observacoes')
        )
        
        db.session.add(cliente)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Cliente criado com sucesso',
            'data': cliente.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao criar cliente: {str(e)}'
        }), 500


@cliente_bp.route('/<int:cliente_id>', methods=['GET'])
@admin_required
def get_cliente(cliente_id):
    """Busca um cliente específico por ID (Admin)"""
    try:
        cliente = Cliente.query.get(cliente_id)
        
        if not cliente:
            return jsonify({
                'status': 'error',
                'message': 'Cliente não encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': cliente.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao buscar cliente: {str(e)}'
        }), 500


@cliente_bp.route('/<int:cliente_id>', methods=['PUT'])
@admin_required
def update_cliente(cliente_id):
    """Atualiza um cliente existente (Admin)"""
    try:
        cliente = Cliente.query.get(cliente_id)
        
        if not cliente:
            return jsonify({
                'status': 'error',
                'message': 'Cliente não encontrado'
            }), 404
        
        data = request.json
        
        # Validação de campos obrigatórios
        if not data.get('nome'):
            return jsonify({
                'status': 'error',
                'message': 'Nome é obrigatório'
            }), 400
            
        if not data.get('telefone'):
            return jsonify({
                'status': 'error',
                'message': 'Telefone é obrigatório'
            }), 400
        
        # Atualizar campos
        cliente.nome = data.get('nome')
        cliente.telefone = data.get('telefone')
        cliente.email = data.get('email')
        cliente.endereco = data.get('endereco')
        cliente.bairro = data.get('bairro')
        cliente.cidade = data.get('cidade')
        cliente.observacoes = data.get('observacoes')
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Cliente atualizado com sucesso',
            'data': cliente.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao atualizar cliente: {str(e)}'
        }), 500


@cliente_bp.route('/<int:cliente_id>', methods=['DELETE'])
@admin_required
def delete_cliente(cliente_id):
    """Deleta um cliente (Admin)"""
    try:
        cliente = Cliente.query.get(cliente_id)
        
        if not cliente:
            return jsonify({
                'status': 'error',
                'message': 'Cliente não encontrado'
            }), 404
        
        db.session.delete(cliente)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Cliente excluído com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao excluir cliente: {str(e)}'
        }), 500


@cliente_bp.route('/buscar/<telefone>', methods=['GET'])
def buscar_por_telefone(telefone):
    """
    Busca cliente por telefone (endpoint público para autocomplete)
    Retorna dados do cliente e estatísticas de pedidos
    """
    try:
        from src.models.pedido import Pedido
        
        # Buscar cliente pelo telefone
        cliente = Cliente.query.filter_by(telefone=telefone).first()
        
        if not cliente:
            # Buscar nos pedidos antigos
            pedido_anterior = Pedido.query.filter_by(telefone=telefone).order_by(Pedido.data_criacao.desc()).first()
            
            if pedido_anterior:
                # Retornar dados do último pedido
                return jsonify({
                    'status': 'success',
                    'data': {
                        'encontrado': True,
                        'nome': pedido_anterior.nome_cliente,
                        'telefone': pedido_anterior.telefone,
                        'endereco': pedido_anterior.endereco,
                        'total_pedidos': Pedido.query.filter_by(telefone=telefone).count()
                    }
                }), 200
            else:
                return jsonify({
                    'status': 'success',
                    'data': {
                        'encontrado': False
                    }
                }), 200
        
        # Contar pedidos do cliente
        total_pedidos = Pedido.query.filter_by(telefone=telefone).count()
        
        return jsonify({
            'status': 'success',
            'data': {
                'encontrado': True,
                'nome': cliente.nome,
                'telefone': cliente.telefone,
                'endereco': cliente.endereco,
                'total_pedidos': total_pedidos
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao buscar cliente: {str(e)}'
        }), 500


@cliente_bp.route('/<telefone>/historico', methods=['GET'])
def historico_pedidos(telefone):
    """
    Retorna histórico de pedidos de um cliente por telefone (endpoint público)
    """
    try:
        from src.models.pedido import Pedido
        
        # Buscar todos os pedidos do telefone
        pedidos = Pedido.query.filter_by(telefone=telefone).order_by(Pedido.data_criacao.desc()).limit(10).all()
        
        if not pedidos:
            return jsonify({
                'status': 'success',
                'data': {
                    'total': 0,
                    'pedidos': []
                }
            }), 200
        
        # Calcular estatísticas
        total_pedidos = len(pedidos)
        valor_total_gasto = sum(p.valor_total for p in pedidos)
        
        return jsonify({
            'status': 'success',
            'data': {
                'total': total_pedidos,
                'valor_total_gasto': valor_total_gasto,
                'pedidos': [p.to_dict() for p in pedidos]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao buscar histórico: {str(e)}'
        }), 500
