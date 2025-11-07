"""
Rotas para cálculo de taxa de entrega.
"""

from flask import Blueprint, request, jsonify
from src.services.delivery_fee import DeliveryFeeCalculator
from src.services.google_maps import GoogleMapsService

delivery_bp = Blueprint("delivery", __name__)


@delivery_bp.route("/calcular-taxa", methods=["POST"])
def calcular_taxa():
    """
    Calcula a taxa de entrega baseada na distância.
    
    Corpo da requisição (JSON):
    {
        "distancia_km": 5.2
    }
    
    Resposta:
    {
        "status": "success",
        "data": {
            "taxa": 7.00,
            "distancia": 5.2,
            "faixa": "5.5km a 6.5km"
        }
    }
    """
    dados = request.json
    
    if not dados or "distancia_km" not in dados:
        return jsonify({
            "status": "error",
            "message": "Campo 'distancia_km' é obrigatório."
        }), 400
    
    try:
        distancia_km = float(dados["distancia_km"])
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "O campo 'distancia_km' deve ser um número válido."
        }), 400
    
    resultado = DeliveryFeeCalculator.calcular_taxa(distancia_km)
    
    if resultado["erro"]:
        return jsonify({
            "status": "error",
            "message": resultado["erro"],
            "data": resultado
        }), 400
    
    return jsonify({
        "status": "success",
        "data": resultado
    }), 200


@delivery_bp.route("/calcular-total", methods=["POST"])
def calcular_total():
    """
    Calcula o valor total do pedido incluindo taxa de entrega.
    
    Corpo da requisição (JSON):
    {
        "valor_pedido": 45.50,
        "distancia_km": 3.2
    }
    
    Resposta:
    {
        "status": "success",
        "data": {
            "valor_pedido": 45.50,
            "taxa_entrega": 5.00,
            "valor_total": 50.50,
            "distancia": 3.2,
            "faixa": "2.5km a 3.5km"
        }
    }
    """
    dados = request.json
    
    if not dados:
        return jsonify({
            "status": "error",
            "message": "Corpo da requisição vazio."
        }), 400
    
    campos_obrigatorios = ["valor_pedido", "distancia_km"]
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({
                "status": "error",
                "message": f"Campo '{campo}' é obrigatório."
            }), 400
    
    try:
        valor_pedido = float(dados["valor_pedido"])
        distancia_km = float(dados["distancia_km"])
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Os campos 'valor_pedido' e 'distancia_km' devem ser números válidos."
        }), 400
    
    resultado = DeliveryFeeCalculator.calcular_valor_total(valor_pedido, distancia_km)
    
    if resultado["erro"]:
        return jsonify({
            "status": "error",
            "message": resultado["erro"],
            "data": resultado
        }), 400
    
    return jsonify({
        "status": "success",
        "data": resultado
    }), 200


@delivery_bp.route("/tabela-taxas", methods=["GET"])
def obter_tabela_taxas():
    """
    Retorna a tabela completa de taxas de entrega.
    
    Resposta:
    {
        "status": "success",
        "data": [
            {"faixa": "0km a 1,5km", "taxa": "R$ 3,00"},
            {"faixa": "1,5km a 2,5km", "taxa": "R$ 4,00"},
            ...
        ]
    }
    """
    tabela = DeliveryFeeCalculator.obter_tabela_completa()
    
    return jsonify({
        "status": "success",
        "data": tabela
    }), 200


@delivery_bp.route("/calcular-distancia", methods=["POST"])
def calcular_distancia():
    """
    Calcula a distância entre o restaurante e o endereço do cliente usando Google Maps.
    
    Corpo da requisição (JSON):
    {
        "endereco": "Rua Exemplo, 123, São Paulo, SP"
    }
    
    Resposta:
    {
        "status": "success",
        "data": {
            "distancia_km": 3.2,
            "distancia_texto": "3.2 km",
            "duracao_texto": "15 mins",
            "endereco_origem": "Rua Restaurante, 100",
            "endereco_destino": "Rua Exemplo, 123"
        }
    }
    """
    dados = request.json
    
    if not dados or "endereco" not in dados:
        return jsonify({
            "status": "error",
            "message": "Campo 'endereco' é obrigatório."
        }), 400
    
    endereco = dados["endereco"]
    
    if not endereco or not endereco.strip():
        return jsonify({
            "status": "error",
            "message": "Endereço não pode ser vazio."
        }), 400
    
    resultado = GoogleMapsService.calcular_distancia(endereco)
    
    if resultado["erro"]:
        return jsonify({
            "status": "error",
            "message": resultado["erro"],
            "data": resultado
        }), 400
    
    return jsonify({
        "status": "success",
        "data": resultado
    }), 200


@delivery_bp.route("/calcular-distancia-e-taxa", methods=["POST"])
def calcular_distancia_e_taxa():
    """
    Calcula a distância usando Google Maps e já retorna a taxa de entrega.
    
    Corpo da requisição (JSON):
    {
        "endereco": "Rua Exemplo, 123, São Paulo, SP",
        "valor_pedido": 45.50  // Opcional
    }
    
    Resposta:
    {
        "status": "success",
        "data": {
            "distancia_km": 3.2,
            "distancia_texto": "3.2 km",
            "duracao_texto": "15 mins",
            "taxa_entrega": 5.0,
            "faixa": "2.5km a 3.5km",
            "valor_pedido": 45.50,  // Se fornecido
            "valor_total": 50.50     // Se valor_pedido fornecido
        }
    }
    """
    dados = request.json
    
    if not dados or "endereco" not in dados:
        return jsonify({
            "status": "error",
            "message": "Campo 'endereco' é obrigatório."
        }), 400
    
    endereco = dados["endereco"]
    valor_pedido = dados.get("valor_pedido")
    
    if not endereco or not endereco.strip():
        return jsonify({
            "status": "error",
            "message": "Endereço não pode ser vazio."
        }), 400
    
    # Calcular distância
    resultado_maps = GoogleMapsService.calcular_distancia(endereco)
    
    if resultado_maps["erro"]:
        return jsonify({
            "status": "error",
            "message": resultado_maps["erro"]
        }), 400
    
    distancia_km = resultado_maps["distancia_km"]
    
    # Calcular taxa
    resultado_taxa = DeliveryFeeCalculator.calcular_taxa(distancia_km)
    
    if resultado_taxa["erro"]:
        return jsonify({
            "status": "error",
            "message": resultado_taxa["erro"]
        }), 400
    
    # Montar resposta
    resposta = {
        "distancia_km": distancia_km,
        "distancia_texto": resultado_maps["distancia_texto"],
        "duracao_texto": resultado_maps["duracao_texto"],
        "taxa_entrega": resultado_taxa["taxa"],
        "faixa": resultado_taxa["faixa"],
        "endereco_origem": resultado_maps["endereco_origem"],
        "endereco_destino": resultado_maps["endereco_destino"]
    }
    
    # Se valor do pedido foi fornecido, calcular total
    if valor_pedido is not None:
        try:
            valor_pedido = float(valor_pedido)
            valor_total = round(valor_pedido + resultado_taxa["taxa"], 2)
            resposta["valor_pedido"] = valor_pedido
            resposta["valor_total"] = valor_total
        except (ValueError, TypeError):
            pass
    
    return jsonify({
        "status": "success",
        "data": resposta
    }), 200


@delivery_bp.route("/status-google-maps", methods=["GET"])
def status_google_maps():
    """
    Verifica o status da configuração do Google Maps.
    
    Resposta:
    {
        "status": "success",
        "data": {
            "configurado": true,
            "mensagem": "Google Maps configurado corretamente.",
            "endereco_restaurante": "Rua Exemplo, 100",
            "api_key_presente": true
        }
    }
    """
    resultado = GoogleMapsService.validar_configuracao()
    
    return jsonify({
        "status": "success" if resultado["configurado"] else "warning",
        "data": resultado
    }), 200

