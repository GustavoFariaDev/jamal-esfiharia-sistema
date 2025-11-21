"""
Módulo auxiliar para determinar o tipo de produto baseado na categoria
"""

def get_product_type(categoria: str) -> str:
    """
    Retorna o tipo de produto baseado na categoria.
    
    Args:
        categoria: String da categoria do produto (ex: "ESFIHAS SALGADAS", "PIZZAS DOCES")
    
    Returns:
        String com o tipo do produto (ex: "ESFIHA", "PIZZA", "BEIRUTE")
    """
    if not categoria:
        return ""
    
    categoria_upper = categoria.upper()
    
    # Mapeamento de categorias para tipos
    if 'ESFIHA' in categoria_upper:
        return "ESFIHA"
    elif 'PIZZA' in categoria_upper:
        return "PIZZA"
    elif 'BEIRUTE' in categoria_upper:
        return "BEIRUTE"
    elif 'FOGAZZ' in categoria_upper:
        return "FOGAZZ"
    elif 'PASTEL' in categoria_upper or 'PASTÉIS' in categoria_upper:
        return "PASTEL"
    elif 'BATATA' in categoria_upper:
        return "BATATA"
    elif 'SALGADO' in categoria_upper:
        return "SALGADO"
    elif 'BEBIDA' in categoria_upper:
        return "BEBIDA"
    else:
        return ""


def get_product_subtype(categoria: str) -> str:
    """
    Retorna o subtipo do produto baseado na categoria.
    
    Args:
        categoria: String da categoria do produto
    
    Returns:
        String com o subtipo (ex: "Salgada", "Doce", "Especial")
    """
    if not categoria:
        return ""
    
    categoria_upper = categoria.upper()
    
    if 'DOCE' in categoria_upper or 'DOCES' in categoria_upper:
        return "Doce"
    elif 'ESPECIAL' in categoria_upper or 'ESPECIAIS' in categoria_upper:
        return "Especial"
    elif 'VEGETARIANA' in categoria_upper or 'VEGETARIANOS' in categoria_upper:
        return "Vegetariana"
    elif 'SALGADA' in categoria_upper or 'SALGADOS' in categoria_upper:
        return "Salgada"
    elif 'SIMPLES' in categoria_upper:
        return "Simples"
    elif 'RECHEADA' in categoria_upper:
        return "Recheada"
    else:
        return ""
