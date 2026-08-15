import os
import secrets

from flask import Blueprint, jsonify, request
from src.models.user import db, User

setup_bp = Blueprint("setup", __name__)


@setup_bp.route("/create-admin", methods=["POST"])
def create_admin():
    """
    Cria o usuário admin na primeira instalação.

    Três coisas mudaram aqui, e as três eram furo de verdade:

    1. A rota era PÚBLICA e aceitava GET. Bastava abrir o endereço no navegador
       para criar o administrador do sistema. Agora exige o SETUP_TOKEN, que só
       existe nas variáveis de ambiente do servidor, e só aceita POST — GET fica
       registrado em log de acesso, histórico e proxy.

    2. A senha vinha ESCRITA no código, num repositório público. Agora é
       sorteada na hora e devolvida uma única vez, nesta resposta. Não fica
       guardada em lugar nenhum além do hash no banco.

    3. A senha escrita no código nem era a que ficava valendo: o texto do
       set_password tinha `}` e o texto devolvido na resposta tinha `}}`. Quem
       usasse a rota recebia uma senha que não entrava.
    """
    token_esperado = os.getenv('SETUP_TOKEN')
    if not token_esperado:
        return jsonify({
            "status": "error",
            "message": "Setup desabilitado. Defina SETUP_TOKEN no servidor para liberar esta rota."
        }), 403

    # compare_digest: comparação de string comum vaza o tamanho do prefixo certo
    # pelo tempo de resposta, e este token cria administrador.
    token_recebido = request.headers.get('X-Setup-Token', '')
    if not secrets.compare_digest(token_recebido, token_esperado):
        return jsonify({
            "status": "error",
            "message": "Token de setup inválido."
        }), 403

    try:
        if User.query.filter_by(username='admin').first():
            return jsonify({
                "status": "info",
                "message": "Usuário admin já existe",
                "username": "admin"
            }), 200

        senha = secrets.token_urlsafe(18)
        novo_admin = User(
            username='admin',
            email=os.getenv('ADMIN_EMAIL', 'admin@jamal.com'),
            is_admin=True
        )
        novo_admin.set_password(senha)

        db.session.add(novo_admin)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Usuário admin criado com sucesso!",
            "username": "admin",
            "password": senha,
            "note": "Anote agora: esta senha não será mostrada de novo. Troque-a após o primeiro login."
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao criar admin: {str(e)}"
        }), 500
