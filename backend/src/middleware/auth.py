from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from src.models.user import User

def usuario_atual_id():
    """
    ID do usuário do token, já como int — ou None se não houver token válido.

    O token guarda o `sub` como STRING: o flask-jwt-extended 4.7 recusa
    qualquer outra coisa na hora de LER o token ("Subject must be a string"),
    seguindo a RFC 7519. O banco, por sua vez, guarda o id como INTEGER.

    A conversão mora aqui, num lugar só, porque espalhada ela vira bug: no
    SQLite comparar '3' com 3 até funciona por coerção, mas no Postgres (que é
    o banco do deploy) a mesma comparação nem chega a acontecer — o driver
    manda texto e o banco recusa comparar texto com inteiro.
    """
    identidade = get_jwt_identity()
    if identidade is None:
        return None
    try:
        return int(identidade)
    except (TypeError, ValueError):
        return None


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
            user_id = usuario_atual_id()
            
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
        return User.query.get(usuario_atual_id())
    except:
        return None
