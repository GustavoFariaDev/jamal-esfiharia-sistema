from flask import Blueprint, jsonify
from src.models.user import db, User

setup_bp = Blueprint("setup", __name__)

@setup_bp.route("/create-admin", methods=["POST", "GET"])
def create_admin():
    """Cria usuário admin se não existir - endpoint de setup inicial"""
    try:
        # Verificar se admin já existe
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            return jsonify({
                "status": "info",
                "message": "Usuário admin já existe",
                "username": "admin"
            }), 200
        
        # Criar novo admin
        novo_admin = User(
            username='admin',
            email='admin@jamal.com',
            is_admin=True
        )
        novo_admin.set_password('SOA$k4N_,f}xj*X?RZ3ZVO^LripwE*Ck')
        
        db.session.add(novo_admin)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Usuário admin criado com sucesso!",
            "username": "admin",
            "password": "SOA$k4N_,f}}xj*X?RZ3ZVO^LripwE*Ck",
            "note": "Por favor, altere a senha após o primeiro login"
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao criar admin: {str(e)}"
        }), 500
