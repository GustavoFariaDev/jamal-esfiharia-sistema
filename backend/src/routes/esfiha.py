from flask import Blueprint, jsonify, request
from src.models.esfiha import Esfiha
from src.models.user import db
from src.middleware.auth import admin_required

esfiha_bp = Blueprint("esfiha", __name__)


# ==============================
# ROTAS PÚBLICAS
# ==============================

@esfiha_bp.route("/", methods=["GET", "OPTIONS"])
def get_esfihas():
    if request.method == 'OPTIONS':
        return '', 200
    """Lista todas as esfihas com filtros opcionais."""
    # Parâmetros de filtro
    categoria = request.args.get('categoria')
    search = request.args.get('search')
    disponivel = request.args.get('disponivel')
    
    # Parâmetros de paginação
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 1000, type=int)
    
    query = Esfiha.query
    
    # Aplicar filtros
    if categoria:
        # Filtro case-insensitive para categoria
        query = query.filter(db.func.lower(Esfiha.categoria) == categoria.lower())
    
    if search:
        # Busca case-insensitive para nome
        query = query.filter(Esfiha.nome.ilike(f'%{search}%'))
    
    if disponivel is not None:
        disponivel_bool = disponivel.lower() in ['true', '1', 'yes']
        query = query.filter_by(disponivel=disponivel_bool)
    
    # Paginação
    pagination = query.order_by(Esfiha.nome).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        "status": "success",
        "data": [esfiha.to_dict() for esfiha in pagination.items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }), 200


@esfiha_bp.route("/<int:esfiha_id>", methods=["GET"])
def get_esfiha(esfiha_id):
    """Obtém uma esfiha específica por ID."""
    esfiha = Esfiha.query.get(esfiha_id)
    
    if not esfiha:
        return jsonify({
            "status": "error",
            "message": "Esfiha não encontrada."
        }), 404
    
    return jsonify({
        "status": "success",
        "data": esfiha.to_dict()
    }), 200


# ==============================
# ROTAS ADMINISTRATIVAS
# ==============================

@esfiha_bp.route("/", methods=["POST"])
@admin_required
def add_esfiha():
    """Adiciona uma nova esfiha (Admin)."""
    data = request.json
    
    # Validação de campos obrigatórios
    nome = data.get("nome")
    preco = data.get("preco")

    if not nome:
        return jsonify({
            "status": "error",
            "message": "Nome é obrigatório."
        }), 400
    
    if not preco:
        return jsonify({
            "status": "error",
            "message": "Preço é obrigatório."
        }), 400

    # Validar tipo do preço
    try:
        preco = float(preco)
        if preco < 0:
            return jsonify({
                "status": "error",
                "message": "Preço não pode ser negativo."
            }), 400
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Preço inválido."
        }), 400

    # Verificar se já existe esfiha com o mesmo nome
    if Esfiha.query.filter_by(nome=nome).first():
        return jsonify({
            "status": "error",
            "message": "Já existe uma esfiha com este nome."
        }), 409

    try:
        new_esfiha = Esfiha(
            nome=nome,
            descricao=data.get("descricao", ""),
            preco=preco,
            categoria=data.get("categoria", ""),
            disponivel=data.get("disponivel", True),
            imagem_url=data.get("imagem_url", "")
        )
        db.session.add(new_esfiha)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Esfiha adicionada com sucesso.",
            "data": new_esfiha.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao adicionar esfiha: {str(e)}"
        }), 500


@esfiha_bp.route("/<int:esfiha_id>", methods=["PUT"])
@admin_required
def update_esfiha(esfiha_id):
    """Atualiza uma esfiha existente (Admin)."""
    print(f"\n=== UPDATE ESFIHA ID: {esfiha_id} ===")
    
    esfiha = Esfiha.query.get(esfiha_id)
    
    if not esfiha:
        print(f"ERRO: Esfiha {esfiha_id} não encontrada")
        return jsonify({
            "status": "error",
            "message": "Esfiha não encontrada."
        }), 404
    
    data = request.json
    print(f"Dados recebidos: {data}")
    print(f"Esfiha atual: nome={esfiha.nome}, preco={esfiha.preco}, categoria={esfiha.categoria}")

    # Atualizar nome se fornecido
    if "nome" in data and data["nome"] != esfiha.nome:
        # Verificar se já existe outra esfiha com o mesmo nome (excluindo a própria)
        existing = Esfiha.query.filter_by(nome=data["nome"]).first()
        if existing and existing.id != esfiha.id:
            return jsonify({
                "status": "error",
                "message": "Já existe uma esfiha com este nome."
            }), 409
        esfiha.nome = data["nome"]

    # Atualizar descrição
    if "descricao" in data:
        esfiha.descricao = data["descricao"]

    # Atualizar preço
    if "preco" in data:
        try:
            preco = float(data["preco"])
            if preco < 0:
                return jsonify({
                    "status": "error",
                    "message": "Preço não pode ser negativo."
                }), 400
            esfiha.preco = preco
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Preço inválido."
            }), 400

    # Atualizar categoria
    if "categoria" in data:
        esfiha.categoria = data["categoria"]

    # Atualizar disponibilidade
    if "disponivel" in data:
        esfiha.disponivel = bool(data["disponivel"])

    # Atualizar URL da imagem
    if "imagem_url" in data:
        esfiha.imagem_url = data["imagem_url"]

    try:
        db.session.commit()
        print(f"SUCESSO: Esfiha {esfiha_id} atualizada")
        print(f"Esfiha atualizada: nome={esfiha.nome}, preco={esfiha.preco}, categoria={esfiha.categoria}")
        result = esfiha.to_dict()
        print(f"Retornando: {result}")
        return jsonify({
            "status": "success",
            "message": "Esfiha atualizada com sucesso.",
            "data": result
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"ERRO ao commitar: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao atualizar esfiha: {str(e)}"
        }), 500


@esfiha_bp.route("/<int:esfiha_id>", methods=["DELETE"])
@admin_required
def delete_esfiha(esfiha_id):
    """Deleta uma esfiha (Admin)."""
    esfiha = Esfiha.query.get(esfiha_id)
    
    if not esfiha:
        return jsonify({
            "status": "error",
            "message": "Esfiha não encontrada."
        }), 404
    
    try:
        db.session.delete(esfiha)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Esfiha deletada com sucesso."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao deletar esfiha: {str(e)}"
        }), 500


@esfiha_bp.route("/<int:esfiha_id>/toggle-disponibilidade", methods=["PATCH"])
@admin_required
def toggle_disponibilidade(esfiha_id):
    """Alterna a disponibilidade de uma esfiha (Admin)."""
    esfiha = Esfiha.query.get(esfiha_id)
    
    if not esfiha:
        return jsonify({
            "status": "error",
            "message": "Esfiha não encontrada."
        }), 404
    
    esfiha.disponivel = not esfiha.disponivel
    
    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": f"Esfiha {'disponibilizada' if esfiha.disponivel else 'indisponibilizada'} com sucesso.",
            "data": esfiha.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": f"Erro ao atualizar disponibilidade: {str(e)}"
        }), 500


@esfiha_bp.route("/admin/estatisticas", methods=["GET"])
@admin_required
def obter_estatisticas_esfihas():
    """Retorna estatísticas sobre as esfihas (Admin)."""
    try:
        total_esfihas = Esfiha.query.count()
        esfihas_disponiveis = Esfiha.query.filter_by(disponivel=True).count()
        esfihas_indisponiveis = Esfiha.query.filter_by(disponivel=False).count()
        
        # Contar por categoria
        categorias = db.session.query(
            Esfiha.categoria, 
            db.func.count(Esfiha.id)
        ).group_by(Esfiha.categoria).all()
        
        categorias_dict = {cat: count for cat, count in categorias if cat}
        
        return jsonify({
            "status": "success",
            "data": {
                "total_esfihas": total_esfihas,
                "esfihas_disponiveis": esfihas_disponiveis,
                "esfihas_indisponiveis": esfihas_indisponiveis,
                "por_categoria": categorias_dict
            }
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Erro ao obter estatísticas: {str(e)}"
        }), 500
