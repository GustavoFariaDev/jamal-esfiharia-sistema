from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User, db
from src.middleware.auth import admin_required

user_bp = Blueprint("user", __name__)


# ==============================
# ROTAS PÚBLICAS
# ==============================

@user_bp.route("/register", methods=["POST"])
def register_user():
    """Registra um novo usuário no sistema."""
    data = request.json
    
    # Validação de campos obrigatórios
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({
            "status": "error",
            "message": "Nome de usuário, e-mail e senha são obrigatórios."
        }), 400

    # Validação de formato de email básica
    if "@" not in email or "." not in email:
        return jsonify({
            "status": "error",
            "message": "Formato de e-mail inválido."
        }), 400

    # Validação de senha (mínimo 6 caracteres)
    if len(password) < 6:
        return jsonify({
            "status": "error",
            "message": "A senha deve ter no mínimo 6 caracteres."
        }), 400

    # Verificar se usuário já existe
    if User.query.filter_by(username=username).first():
        return jsonify({
            "status": "error",
            "message": "Nome de usuário já existe."
        }), 409
        
    if User.query.filter_by(email=email).first():
        return jsonify({
            "status": "error",
            "message": "E-mail já registrado."
        }), 409

    try:
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Usuário registrado com sucesso.",
            "data": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao registrar usuário: {str(e)}"
        }), 500


@user_bp.route("/login", methods=["POST"])
def login_user():
    """Autentica um usuário e retorna um token JWT."""
    data = request.json
    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({
            "status": "error",
            "message": "Identificador e senha são obrigatórios."
        }), 400

    # Buscar usuário por username ou email
    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if user and user.check_password(password):
        # Criar token JWT com informações adicionais
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'is_admin': user.is_admin,
                'username': user.username
            }
        )
        
        return jsonify({
            "status": "success",
            "access_token": access_token,
            "user": user.to_dict(include_admin=True)
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Credenciais inválidas."
        }), 401


# ==============================
# ROTAS PROTEGIDAS (USUÁRIO)
# ==============================

@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Retorna informações do usuário logado."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            "status": "error",
            "message": "Usuário não encontrado."
        }), 404
        
    return jsonify({
        "status": "success",
        "data": user.to_dict(include_admin=True)
    }), 200


@user_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    """Atualiza informações do usuário logado."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.json

    # Atualizar username se fornecido
    if "username" in data and data["username"] != user.username:
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({
                "status": "error",
                "message": "Nome de usuário já existe."
            }), 409
        user.username = data["username"]

    # Atualizar email se fornecido
    if "email" in data and data["email"] != user.email:
        if "@" not in data["email"] or "." not in data["email"]:
            return jsonify({
                "status": "error",
                "message": "Formato de e-mail inválido."
            }), 400
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({
                "status": "error",
                "message": "E-mail já registrado."
            }), 409
        user.email = data["email"]

    # Atualizar senha se fornecida
    if "password" in data:
        if len(data["password"]) < 6:
            return jsonify({
                "status": "error",
                "message": "A senha deve ter no mínimo 6 caracteres."
            }), 400
        user.set_password(data["password"])

    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Usuário atualizado com sucesso.",
            "data": user.to_dict(include_admin=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao atualizar usuário: {str(e)}"
        }), 500


# ==============================
# ROTAS ADMINISTRATIVAS
# ==============================

@user_bp.route("/admin/users", methods=["GET"])
@admin_required
def get_all_users():
    """Lista todos os usuários (Admin)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    
    # Filtro de busca por username ou email
    if search:
        query = query.filter(
            (User.username.contains(search)) | (User.email.contains(search))
        )
    
    # Paginação
    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        "status": "success",
        "data": [user.to_dict(include_admin=True) for user in pagination.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }), 200


@user_bp.route("/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user_by_id(user_id):
    """Obtém um usuário específico por ID (Admin)."""
    user = User.query.get_or_404(user_id)
    return jsonify({
        "status": "success",
        "data": user.to_dict(include_admin=True)
    }), 200


@user_bp.route("/admin/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user_by_admin(user_id):
    """Atualiza um usuário específico (Admin)."""
    user = User.query.get_or_404(user_id)
    data = request.json

    # Atualizar username
    if "username" in data and data["username"] != user.username:
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({
                "status": "error",
                "message": "Nome de usuário já existe."
            }), 409
        user.username = data["username"]

    # Atualizar email
    if "email" in data and data["email"] != user.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({
                "status": "error",
                "message": "E-mail já registrado."
            }), 409
        user.email = data["email"]

    # Atualizar senha
    if "password" in data:
        user.set_password(data["password"])

    # Atualizar status de admin
    if "is_admin" in data:
        user.is_admin = bool(data["is_admin"])

    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Usuário atualizado com sucesso.",
            "data": user.to_dict(include_admin=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao atualizar usuário: {str(e)}"
        }), 500


@user_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user_by_admin(user_id):
    """Deleta um usuário específico (Admin)."""
    current_user_id = get_jwt_identity()
    
    # Impedir que admin delete a si mesmo
    if current_user_id == user_id:
        return jsonify({
            "status": "error",
            "message": "Você não pode deletar sua própria conta."
        }), 400
    
    user = User.query.get_or_404(user_id)
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Usuário deletado com sucesso."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao deletar usuário: {str(e)}"
        }), 500


@user_bp.route("/admin/users/<int:user_id>/toggle-admin", methods=["PATCH"])
@admin_required
def toggle_admin_status(user_id):
    """Alterna o status de administrador de um usuário (Admin)."""
    current_user_id = get_jwt_identity()
    
    # Impedir que admin remova seu próprio status de admin
    if current_user_id == user_id:
        return jsonify({
            "status": "error",
            "message": "Você não pode alterar seu próprio status de administrador."
        }), 400
    
    user = User.query.get_or_404(user_id)
    user.is_admin = not user.is_admin
    
    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": f"Status de administrador {'ativado' if user.is_admin else 'desativado'} com sucesso.",
            "data": user.to_dict(include_admin=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao atualizar status: {str(e)}"
        }), 500
