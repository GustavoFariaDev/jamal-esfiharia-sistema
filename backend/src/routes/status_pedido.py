from flask import Blueprint, jsonify, request
from src.models.pedido import Pedido

status_pedido_bp = Blueprint('status_pedido', __name__)

@status_pedido_bp.route('/consultar-status', methods=['POST'])
def consultar_status():
    """
    Endpoint público para cliente consultar status do pedido por telefone
    Não requer autenticação
    """
    try:
        data = request.json
        telefone = data.get('telefone')
        
        if not telefone:
            return jsonify({
                'status': 'error',
                'message': 'Telefone é obrigatório'
            }), 400
        
        # Limpar telefone (remover caracteres especiais)
        telefone_limpo = ''.join(filter(str.isdigit, telefone))
        
        # Buscar pedidos do telefone (últimos 5, ordenados por data)
        pedidos = Pedido.query.filter_by(telefone=telefone_limpo).order_by(Pedido.data_criacao.desc()).limit(5).all()
        
        if not pedidos:
            return jsonify({
                'status': 'success',
                'message': 'Nenhum pedido encontrado para este telefone',
                'data': {
                    'encontrado': False,
                    'pedidos': []
                }
            }), 200
        
        # Formatar dados dos pedidos
        pedidos_formatados = []
        for pedido in pedidos:
            pedidos_formatados.append({
                'id': pedido.id,
                'status': pedido.status,
                'valor_total': pedido.valor_total,
                'forma_entrega': pedido.forma_entrega,
                'data_criacao': pedido.data_criacao.isoformat() if pedido.data_criacao else None,
                'itens': [item.to_dict() for item in pedido.itens]
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'encontrado': True,
                'nome_cliente': pedidos[0].nome_cliente,
                'pedidos': pedidos_formatados
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao consultar status: {str(e)}'
        }), 500
