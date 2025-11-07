from flask import Blueprint, jsonify, request
from src.models.esfiha import Esfiha
from src.models.user import db
from sqlalchemy import distinct

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("", methods=["GET", "OPTIONS"])
@categories_bp.route("/", methods=["GET", "OPTIONS"])
def get_categories():
    if request.method == 'OPTIONS':
        return '', 200
    """Retorna todas as categorias únicas dos produtos."""
    try:
        # Buscar todas as categorias distintas que não são nulas
        categories = db.session.query(distinct(Esfiha.categoria)).filter(
            Esfiha.categoria.isnot(None),
            Esfiha.categoria != ''
        ).all()
        
        # Converter para lista de objetos com id e name
        # O id é a versão lowercase para facilitar filtros
        category_list = []
        
        # Adicionar opção "Todos" primeiro
        category_list.append({
            "id": "all",
            "name": "Todas as Categorias"
        })
        
        # Adicionar categorias do banco
        for cat in categories:
            if cat[0]:
                category_list.append({
                    "id": cat[0].lower(),  # ID em lowercase para filtros
                    "name": cat[0]         # Nome original com capitalização
                })
        
        return jsonify({
            "status": "success",
            "data": category_list
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro ao buscar categorias: {str(e)}"
        }), 500

