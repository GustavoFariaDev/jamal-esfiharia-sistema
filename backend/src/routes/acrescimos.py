from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.acrescimo import Acrescimo
from src.middleware.auth import admin_required

acrescimos_bp = Blueprint('acrescimos', __name__)

@acrescimos_bp.route('/acrescimos', methods=['GET'])
def get_acrescimos():
    """
    Retorna todos os acréscimos disponíveis
    Query params:
    - tipo: filtrar por tipo (esfiha, pizza_metade, pizza_toda, borda)
    """
    try:
        tipo = request.args.get('tipo')
        
        if tipo:
            acrescimos = Acrescimo.query.filter_by(tipo=tipo, disponivel=True).order_by(Acrescimo.ordem).all()
        else:
            acrescimos = Acrescimo.query.filter_by(disponivel=True).order_by(Acrescimo.tipo, Acrescimo.ordem).all()
        
        return jsonify({
            'status': 'success',
            'data': [acrescimo.to_dict() for acrescimo in acrescimos]
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao buscar acréscimos: {str(e)}'
        }), 500


@acrescimos_bp.route('/acrescimos/<int:id>', methods=['GET'])
def get_acrescimo(id):
    """
    Retorna um acréscimo específico
    """
    try:
        acrescimo = Acrescimo.query.get(id)
        
        if not acrescimo:
            return jsonify({
                'status': 'error',
                'message': 'Acréscimo não encontrado'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': acrescimo.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao buscar acréscimo: {str(e)}'
        }), 500


@acrescimos_bp.route('/acrescimos', methods=['POST'])
@admin_required
def create_acrescimo():
    """
    Cria um novo acréscimo (apenas admin)
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('nome') or not data.get('tipo') or data.get('preco') is None:
            return jsonify({
                'status': 'error',
                'message': 'Nome, tipo e preço são obrigatórios'
            }), 400
        
        # Validar tipo
        tipos_validos = ['esfiha', 'pizza_metade', 'pizza_toda', 'borda']
        if data['tipo'] not in tipos_validos:
            return jsonify({
                'status': 'error',
                'message': f'Tipo inválido. Use: {", ".join(tipos_validos)}'
            }), 400
        
        # Validar preço
        try:
            preco = float(data['preco'])
            if preco < 0:
                return jsonify({
                    'status': 'error',
                    'message': 'Preço não pode ser negativo'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'status': 'error',
                'message': 'Preço inválido'
            }), 400
        
        acrescimo = Acrescimo(
            nome=data['nome'],
            tipo=data['tipo'],
            preco=preco,
            disponivel=data.get('disponivel', True),
            ordem=data.get('ordem', 0)
        )
        
        db.session.add(acrescimo)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Acréscimo criado com sucesso',
            'data': acrescimo.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao criar acréscimo: {str(e)}'
        }), 500


@acrescimos_bp.route('/acrescimos/<int:id>', methods=['PUT'])
@admin_required
def update_acrescimo(id):
    """
    Atualiza um acréscimo (apenas admin)
    """
    try:
        acrescimo = Acrescimo.query.get(id)
        
        if not acrescimo:
            return jsonify({
                'status': 'error',
                'message': 'Acréscimo não encontrado'
            }), 404
        
        data = request.get_json()
        
        if 'nome' in data:
            acrescimo.nome = data['nome']
        
        if 'tipo' in data:
            tipos_validos = ['esfiha', 'pizza_metade', 'pizza_toda', 'borda']
            if data['tipo'] not in tipos_validos:
                return jsonify({
                    'status': 'error',
                    'message': f'Tipo inválido. Use: {", ".join(tipos_validos)}'
                }), 400
            acrescimo.tipo = data['tipo']
        
        if 'preco' in data:
            try:
                preco = float(data['preco'])
                if preco < 0:
                    return jsonify({
                        'status': 'error',
                        'message': 'Preço não pode ser negativo'
                    }), 400
                acrescimo.preco = preco
            except (ValueError, TypeError):
                return jsonify({
                    'status': 'error',
                    'message': 'Preço inválido'
                }), 400
        
        if 'disponivel' in data:
            acrescimo.disponivel = bool(data['disponivel'])
        
        if 'ordem' in data:
            acrescimo.ordem = int(data['ordem'])
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Acréscimo atualizado com sucesso',
            'data': acrescimo.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao atualizar acréscimo: {str(e)}'
        }), 500


@acrescimos_bp.route('/acrescimos/<int:id>', methods=['DELETE'])
@admin_required
def delete_acrescimo(id):
    """
    Deleta um acréscimo (apenas admin)
    """
    try:
        acrescimo = Acrescimo.query.get(id)
        
        if not acrescimo:
            return jsonify({
                'status': 'error',
                'message': 'Acréscimo não encontrado'
            }), 404
        
        db.session.delete(acrescimo)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Acréscimo deletado com sucesso'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao deletar acréscimo: {str(e)}'
        }), 500


@acrescimos_bp.route('/acrescimos/<int:id>/toggle-disponibilidade', methods=['PATCH'])
@admin_required
def toggle_disponibilidade(id):
    """
    Alterna a disponibilidade de um acréscimo (apenas admin)
    """
    try:
        acrescimo = Acrescimo.query.get(id)
        
        if not acrescimo:
            return jsonify({
                'status': 'error',
                'message': 'Acréscimo não encontrado'
            }), 404
        
        acrescimo.disponivel = not acrescimo.disponivel
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f"Acréscimo {'ativado' if acrescimo.disponivel else 'desativado'} com sucesso",
            'data': acrescimo.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Erro ao atualizar disponibilidade: {str(e)}'
        }), 500
