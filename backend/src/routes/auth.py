from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from src.models.user import User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login usando o sistema de usuários do banco de dados."""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                "status": "error",
                "message": "Username e password são obrigatórios"
            }), 400
        
        # Buscar usuário no banco
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                "status": "error",
                "message": "Credenciais inválidas"
            }), 401
        
        # Criar token JWT usando flask-jwt-extended
        additional_claims = {
            'username': user.username,
            'is_admin': user.is_admin
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims,
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            "status": "success",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro interno: {str(e)}"
        }), 500

@auth_bp.route("/verify", methods=["GET"])
@jwt_required()
def verify_token():
    """Verifica se o token é válido."""
    try:
        # Obter ID do usuário do token
        user_id = get_jwt_identity()
        
        # Buscar usuário no banco para verificar se ainda existe e está ativo
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                "status": "error",
                "message": "Usuário não encontrado"
            }), 401
        
        return jsonify({
            "status": "success",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro interno: {str(e)}"
        }), 500
