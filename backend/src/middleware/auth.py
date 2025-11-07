from functools import wraps
from flask import request, jsonify
import jwt
import os
from src.models.user import User

# Chave secreta para JWT (deve ser a mesma usada na autenticação)
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-key-change-in-production')

def admin_required(f):
    """
    Decorator para proteger rotas que requerem privilégios de administrador.
    Verifica se o usuário está autenticado e se possui is_admin=True.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Obter token do header Authorization
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    'status': 'error',
                    'message': 'Token de acesso não fornecido'
                }), 401
            
            token = auth_header.split(' ')[1]
            
            # Decodificar o token JWT
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            # Buscar o usuário no banco de dados
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'Usuário não encontrado'
                }), 404
            
            # Verifica se o usuário é admin
            if not user.is_admin:
                return jsonify({
                    'status': 'error',
                    'message': 'Acesso negado. Apenas administradores podem acessar este recurso.'
                }), 403
            
            # Adicionar usuário ao contexto da requisição
            request.current_user = user
            
            # Se passou por todas as verificações, executa a função
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error',
                'message': 'Token expirado'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'status': 'error',
                'message': 'Token inválido'
            }), 401
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Erro na autenticação: {str(e)}'
            }), 401
    
    return decorated_function


def get_current_user():
    """
    Função auxiliar para obter o usuário atual autenticado.
    Retorna None se não houver usuário autenticado.
    """
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        return User.query.get(user_id)
    except:
        return None
