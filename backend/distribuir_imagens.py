#!/usr/bin/env python3
"""
Script para distribuir imagens apropriadas para cada categoria de produto
"""

import sqlite3
import os
import shutil
from datetime import datetime
import random

# Diretório de uploads
UPLOAD_DIR = "/home/ubuntu/jamal_sistema/jamal_live_melhorado/backend/static/uploads"

# Mapeamento de imagens por categoria
IMAGENS_POR_CATEGORIA = {
    'ESFIHAS SALGADAS': [
        '/home/ubuntu/upload/search_images/8Tsy2fotYkoZ.jpg',
        '/home/ubuntu/upload/search_images/aoVYcOZFdDwp.jpg',
        '/home/ubuntu/upload/search_images/9VkmZYCrlb3q.jpg',
        '/home/ubuntu/upload/search_images/TXB9Vuzx6l8W.webp',
        '/home/ubuntu/upload/search_images/VroUdSgAZNsG.jpg',
    ],
    'ESFIHAS DOCES': [
        '/home/ubuntu/upload/search_images/LSYjt4QUpndn.jpg',
        '/home/ubuntu/upload/search_images/O4gn2zJ2ZoAw.jpeg',
        '/home/ubuntu/upload/search_images/i3CfSUkSCk3Q.jpg',
    ],
    'PASTÉIS SALGADOS': [
        '/home/ubuntu/upload/search_images/pbZmC6bygzCt.png',
        '/home/ubuntu/upload/search_images/njvcFSaVAmuW.jpg',
        '/home/ubuntu/upload/search_images/C0aRoCw1ITgU.jpg',
        '/home/ubuntu/upload/search_images/TKp3qNJKgGKq.jpg',
    ],
    'PASTÉIS DOCES': [
        '/home/ubuntu/upload/search_images/VPjNe84xSc5H.jpg',
    ],
    'SALGADOS': [
        '/home/ubuntu/upload/search_images/jWzjN5zYLrMD.jpg',
        '/home/ubuntu/upload/search_images/KKDh8z7LjXu2.jpg',
        '/home/ubuntu/upload/search_images/A1Mu3b1P8CH0.jpg',
        '/home/ubuntu/upload/search_images/u95kH0FU6BO4.jpg',
    ],
    'PIZZAS SALGADAS': [
        '/home/ubuntu/upload/search_images/7BRAt5PWA33J.jpg',
        '/home/ubuntu/upload/search_images/4mVtIr2hPI0h.jpg',
        '/home/ubuntu/upload/search_images/S4zxQRsO4obI.jpg',
        '/home/ubuntu/upload/search_images/uy30vJFSkIrN.jpg',
    ],
}

def copiar_imagem_unica(imagem_origem, produto_id, produto_nome):
    """Copia imagem com nome único baseado no ID do produto"""
    if not os.path.exists(imagem_origem):
        return None
    
    extensao = os.path.splitext(imagem_origem)[1]
    if extensao == '.webp':
        extensao = '.jpg'  # Converter webp para jpg
    
    nome_arquivo = f"produto_{produto_id}_{produto_nome[:30].lower().replace(' ', '_').replace('/', '_')}{extensao}"
    destino = os.path.join(UPLOAD_DIR, nome_arquivo)
    
    try:
        shutil.copy2(imagem_origem, destino)
        return f"/static/uploads/{nome_arquivo}"
    except Exception as e:
        print(f"Erro ao copiar: {e}")
        return None

def atualizar_categoria(categoria, imagens):
    """Atualiza produtos de uma categoria com imagens variadas"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    # Buscar todos os produtos da categoria
    cursor.execute("SELECT id, nome FROM esfiha WHERE categoria = ? ORDER BY id", (categoria,))
    produtos = cursor.fetchall()
    
    if not produtos:
        print(f"⚠ Nenhum produto encontrado para categoria: {categoria}")
        conn.close()
        return 0
    
    print(f"\n{categoria}: {len(produtos)} produtos")
    print("-" * 80)
    
    atualizados = 0
    
    # Distribuir imagens de forma cíclica
    for i, (produto_id, produto_nome) in enumerate(produtos):
        # Selecionar imagem de forma cíclica
        imagem_origem = imagens[i % len(imagens)]
        
        nova_url = copiar_imagem_unica(imagem_origem, produto_id, produto_nome)
        
        if nova_url:
            cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", (nova_url, produto_id))
            atualizados += 1
            if i < 5:  # Mostrar apenas os 5 primeiros
                print(f"  ✓ {produto_nome[:50]}")
    
    if len(produtos) > 5:
        print(f"  ... e mais {len(produtos) - 5} produtos")
    
    conn.commit()
    conn.close()
    
    return atualizados

def main():
    print("=" * 80)
    print("DISTRIBUINDO IMAGENS POR CATEGORIA")
    print("=" * 80)
    
    total_atualizados = 0
    
    for categoria, imagens in IMAGENS_POR_CATEGORIA.items():
        atualizados = atualizar_categoria(categoria, imagens)
        total_atualizados += atualizados
    
    print("\n" + "=" * 80)
    print(f"TOTAL: {total_atualizados} produtos atualizados")
    print("=" * 80)

if __name__ == "__main__":
    main()
