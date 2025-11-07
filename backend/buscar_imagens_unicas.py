#!/usr/bin/env python3
"""
Script para buscar imagens únicas da internet para cada produto
Usa requests para buscar imagens do Unsplash e Pexels
"""

import sqlite3
import os
import requests
import time
from pathlib import Path

UPLOAD_DIR = "/home/ubuntu/jamal_sistema/jamal_live_melhorado/backend/static/uploads"

# Mapeamento de termos de busca por categoria
TERMOS_BUSCA = {
    'PIZZAS SALGADAS': 'pizza {} brazilian',
    'PIZZAS DOCES': 'sweet pizza dessert {}',
    'BEIRUTES': 'arabic sandwich beirut {}',
    'ESFIHAS SALGADAS': 'esfiha meat {} arabic',
    'ESFIHAS DOCES': 'sweet esfiha dessert {}',
    'ESFIHAS VEGETARIANAS': 'vegetarian esfiha {}',
    'ESFIHAS ESPECIAIS': 'gourmet esfiha {}',
    'PASTÉIS SALGADOS': 'brazilian pastel fried {}',
    'PASTÉIS DOCES': 'sweet pastel dessert {}',
    'PASTÉIS VEGETARIANOS': 'vegetarian pastel {}',
    'PASTÉIS ESPECIAIS': 'gourmet pastel {}',
    'FOGAZZES SALGADAS': 'focaccia bread {}',
    'FOGAZZES DOCES': 'sweet focaccia {}',
    'FOGAZZES VEGETARIANAS': 'vegetarian focaccia {}',
    'FOGAZZES ESPECIAIS': 'gourmet focaccia {}',
    'SALGADOS': 'brazilian fried snack {}',
    'BATATA SIMPLES': 'french fries {}',
    'BATATA RECHEADA': 'loaded fries {}',
    'BEBIDAS': 'beverage drink {}',
}

def buscar_imagem_unsplash(termo_busca):
    """Busca imagem no Unsplash"""
    url = f"https://source.unsplash.com/800x600/?{termo_busca.replace(' ', ',')}"
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        if response.status_code == 200:
            return response.content
    except:
        pass
    return None

def baixar_e_salvar_imagem(produto_id, produto_nome, categoria):
    """Baixa e salva imagem única para o produto"""
    # Criar termo de busca
    template = TERMOS_BUSCA.get(categoria, 'food {}')
    termo = template.format(produto_nome.lower().replace('c/', 'with'))
    
    # Buscar imagem
    imagem_data = buscar_imagem_unsplash(termo)
    
    if imagem_data:
        # Salvar imagem
        nome_arquivo = f"produto_{produto_id}_unique.jpg"
        caminho = os.path.join(UPLOAD_DIR, nome_arquivo)
        
        with open(caminho, 'wb') as f:
            f.write(imagem_data)
        
        return f"/static/uploads/{nome_arquivo}"
    
    return None

def processar_produtos_em_lote(limite=50):
    """Processa produtos em lotes"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    # Buscar produtos
    cursor.execute("""
        SELECT id, nome, categoria 
        FROM esfiha 
        ORDER BY id 
        LIMIT ?
    """, (limite,))
    
    produtos = cursor.fetchall()
    
    print(f"Processando {len(produtos)} produtos...")
    
    atualizados = 0
    for produto_id, nome, categoria in produtos:
        nova_url = baixar_e_salvar_imagem(produto_id, nome, categoria)
        
        if nova_url:
            cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", 
                          (nova_url, produto_id))
            atualizados += 1
            print(f"✓ {nome[:50]}")
        else:
            print(f"✗ {nome[:50]}")
        
        time.sleep(0.5)  # Delay para não sobrecarregar
    
    conn.commit()
    conn.close()
    
    return atualizados

def main():
    print("=" * 80)
    print("BUSCANDO IMAGENS ÚNICAS DA INTERNET")
    print("=" * 80)
    
    total = processar_produtos_em_lote(50)
    
    print(f"\n✓ {total} produtos atualizados com imagens únicas")

if __name__ == "__main__":
    main()
