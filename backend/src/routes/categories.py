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
    """Retorna todas as categorias únicas dos produtos em ordem lógica."""
    try:
        # Buscar todas as categorias distintas que não são nulas
        categories = db.session.query(distinct(Esfiha.categoria)).filter(
            Esfiha.categoria.isnot(None),
            Esfiha.categoria != ''
        ).all()
        
        # Extrair nomes das categorias
        # Normalizar para maiúsculas para evitar duplicações (ex: BEBIDAS e bebidas)
        category_names = {cat[0].upper() for cat in categories if cat[0]}
        
        # Definir ordem lógica das categorias
        # Ordem: Esfihas → Pizzas → Fogazzes → Pastéis → Beirutes → Acompanhamentos → Bebidas
        # Dentro de cada grupo: Salgados → Especiais → Vegetarianos → Doces
        category_order = [
            # ESFIHAS (produto principal)
            "ESFIHAS SALGADAS",
            "ESFIHAS ESPECIAIS",
            "ESFIHAS VEGETARIANAS",
            "ESFIHAS DOCES",
            
            # PIZZAS
            "PIZZAS SALGADAS",
            "PIZZAS DOCES",
            
            # FOGAZZES
            "FOGAZZES SALGADAS",
            "FOGAZZES ESPECIAIS",
            "FOGAZZES VEGETARIANAS",
            "FOGAZZES DOCES",
            
            # PASTÉIS
            "PASTÉIS SALGADOS",
            "PASTÉIS ESPECIAIS",
            "PASTÉIS VEGETARIANOS",
            "PASTÉIS DOCES",
            
            # BEIRUTES
            "BEIRUTES",
            
            # ACOMPANHAMENTOS
            "BATATA SIMPLES",
            "BATATA RECHEADA",
            "SALGADOS",
            
            # BEBIDAS (sempre por último)
            "BEBIDAS"
        ]
        
        # Criar lista ordenada de categorias
        category_list = []
        
        # Adicionar opção "Todos" primeiro
        category_list.append({
            "id": "all",
            "name": "Todas as Categorias"
        })
        
        # Adicionar categorias na ordem definida (apenas as que existem no banco)
        for cat_name in category_order:
            if cat_name in category_names:
                category_list.append({
                    "id": cat_name.lower(),  # ID em lowercase para filtros
                    "name": cat_name         # Nome original com capitalização
                })
        
        # Adicionar categorias que não estão na ordem definida (caso existam novas)
        for cat_name in sorted(category_names):
            if cat_name not in category_order:
                category_list.append({
                    "id": cat_name.lower(),
                    "name": cat_name
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
