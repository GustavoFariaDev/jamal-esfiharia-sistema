from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.user import db
from src.services.notificacao_service import NotificacaoService
from src.models.notificacao import Notificacao
from src.middleware.auth import usuario_atual_id

notificacao_bp = Blueprint("notificacao", __name__)


@notificacao_bp.route("/me", methods=["GET"])
@jwt_required(optional=True)
def listar_minhas_notificacoes():
    """
    Lista as notificações do cliente logado ou por telefone
    """
    current_user_id = usuario_atual_id()
    telefone = request.args.get('telefone', None)
    apenas_nao_lidas = request.args.get('apenas_nao_lidas', 'false').lower() == 'true'
    
    # Se não estiver logado e não fornecer telefone, retornar erro
    if not current_user_id and not telefone:
        return jsonify({
            "status": "error",
            "message": "É necessário estar logado ou fornecer o telefone"
        }), 400
    
    # Buscar notificações
    notificacoes = NotificacaoService.buscar_notificacoes_cliente(
        cliente_id=current_user_id,
        telefone=telefone,
        apenas_nao_lidas=apenas_nao_lidas
    )
    
    return jsonify({
        "status": "success",
        "data": [n.to_dict() for n in notificacoes],
        "total": len(notificacoes),
        "nao_lidas": sum(1 for n in notificacoes if not n.lida)
    }), 200


@notificacao_bp.route("/<int:notificacao_id>/marcar-lida", methods=["PATCH"])
@jwt_required(optional=True)
def marcar_notificacao_lida(notificacao_id):
    """
    Marca uma notificação como lida
    """
    current_user_id = usuario_atual_id()
    telefone = request.args.get('telefone', None)
    
    # Buscar notificação
    notificacao = Notificacao.query.get(notificacao_id)
    
    if not notificacao:
        return jsonify({
            "status": "error",
            "message": "Notificação não encontrada"
        }), 404
    
    # Verificar se o cliente tem permissão para marcar como lida
    if current_user_id:
        if notificacao.cliente_id != current_user_id:
            return jsonify({
                "status": "error",
                "message": "Você não tem permissão para marcar esta notificação"
            }), 403
    elif telefone:
        if notificacao.telefone != telefone:
            return jsonify({
                "status": "error",
                "message": "Você não tem permissão para marcar esta notificação"
            }), 403
    else:
        return jsonify({
            "status": "error",
            "message": "É necessário estar logado ou fornecer o telefone"
        }), 400
    
    # Marcar como lida
    success = NotificacaoService.marcar_como_lida(notificacao_id)
    
    if success:
        return jsonify({
            "status": "success",
            "message": "Notificação marcada como lida",
            "data": notificacao.to_dict()
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Erro ao marcar notificação como lida"
        }), 500


@notificacao_bp.route("/marcar-todas-lidas", methods=["PATCH"])
@jwt_required(optional=True)
def marcar_todas_lidas():
    """
    Marca todas as notificações do cliente como lidas
    """
    current_user_id = usuario_atual_id()
    telefone = request.args.get('telefone', None)
    
    if not current_user_id and not telefone:
        return jsonify({
            "status": "error",
            "message": "É necessário estar logado ou fornecer o telefone"
        }), 400
    
    # Marcar todas como lidas
    count = NotificacaoService.marcar_todas_como_lidas(
        cliente_id=current_user_id,
        telefone=telefone
    )
    
    return jsonify({
        "status": "success",
        "message": f"{count} notificações marcadas como lidas",
        "total_marcadas": count
    }), 200


@notificacao_bp.route("/por-telefone/<telefone>", methods=["GET"])
def buscar_por_telefone(telefone):
    """
    Busca notificações por telefone (para clientes não logados)
    """
    apenas_nao_lidas = request.args.get('apenas_nao_lidas', 'false').lower() == 'true'
    
    # Buscar notificações
    notificacoes = NotificacaoService.buscar_notificacoes_cliente(
        telefone=telefone,
        apenas_nao_lidas=apenas_nao_lidas
    )
    
    return jsonify({
        "status": "success",
        "data": [n.to_dict() for n in notificacoes],
        "total": len(notificacoes),
        "nao_lidas": sum(1 for n in notificacoes if not n.lida)
    }), 200
