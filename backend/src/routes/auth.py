from flask import Blueprint, request, jsonify
import jwt
import os
from datetime import datetime, timedelta, timezone
from src.models.user import User

auth_bp = Blueprint("auth", __name__)

# Chave secreta para JWT
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-key-change-in-production')

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
        
        # Criar token JWT
        payload = {
            'sub': str(user.id),  # 'sub' deve ser string segundo JWT spec
            'user_id': user.id,
            'username': user.username,
            'is_admin': user.is_admin,
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }
        
        access_token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
        
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
def verify_token():
    """Verifica se o token é válido."""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                "status": "error",
                "message": "Token não fornecido"
            }), 401
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        
        # Buscar usuário no banco para verificar se ainda existe e está ativo
        user = User.query.get(payload['user_id'])
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
        
    except jwt.ExpiredSignatureError:
        return jsonify({
            "status": "error",
            "message": "Token expirado"
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            "status": "error",
            "message": "Token inválido"
        }), 401
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro interno: {str(e)}"
        }), 500

