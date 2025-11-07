from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from src.models.user import User

def admin_required(f):
    """
    Decorator para proteger rotas que requerem privilégios de administrador.
    Verifica se o usuário está autenticado e se possui is_admin=True.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Verificar JWT usando flask-jwt-extended
            verify_jwt_in_request()
            
            # Obter ID do usuário do token
            user_id = get_jwt_identity()
            
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
            
            # Se passou por todas as verificações, executa a função
            return f(*args, **kwargs)
            
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
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except:
        return None
