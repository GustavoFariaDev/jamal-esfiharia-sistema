#!/usr/bin/env python3
"""
Script completo para distribuir imagens para TODAS as categorias
"""

import sqlite3
import os
import shutil
from datetime import datetime

# Diretório de uploads
UPLOAD_DIR = "/home/ubuntu/jamal_sistema/jamal_live_melhorado/backend/static/uploads"

# Mapeamento completo de imagens por categoria
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
    'ESFIHAS VEGETARIANAS': [
        '/home/ubuntu/upload/search_images/8Tsy2fotYkoZ.jpg',
        '/home/ubuntu/upload/search_images/aoVYcOZFdDwp.jpg',
    ],
    'ESFIHAS ESPECIAIS': [
        '/home/ubuntu/upload/search_images/TXB9Vuzx6l8W.webp',
        '/home/ubuntu/upload/search_images/9VkmZYCrlb3q.jpg',
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
    'PASTÉIS VEGETARIANOS': [
        '/home/ubuntu/upload/search_images/njvcFSaVAmuW.jpg',
        '/home/ubuntu/upload/search_images/C0aRoCw1ITgU.jpg',
    ],
    'PASTÉIS ESPECIAIS': [
        '/home/ubuntu/upload/search_images/TKp3qNJKgGKq.jpg',
        '/home/ubuntu/upload/search_images/pbZmC6bygzCt.png',
    ],
    'FOGAZZES SALGADAS': [
        '/home/ubuntu/upload/search_images/SMJxGVXnVZlf.jpg',
        '/home/ubuntu/upload/search_images/goXuHfimHSRj.jpg',
        '/home/ubuntu/upload/search_images/zj6lIp37bOAo.jpeg',
        '/home/ubuntu/upload/search_images/gU9rsPa8qGQG.jpg',
    ],
    'FOGAZZES DOCES': [
        '/home/ubuntu/upload/search_images/SMJxGVXnVZlf.jpg',
        '/home/ubuntu/upload/search_images/goXuHfimHSRj.jpg',
    ],
    'FOGAZZES VEGETARIANAS': [
        '/home/ubuntu/upload/search_images/HyzwjYFEe3tv.jpg',
        '/home/ubuntu/upload/search_images/skn3L6233x9M.jpg',
    ],
    'FOGAZZES ESPECIAIS': [
        '/home/ubuntu/upload/search_images/gU9rsPa8qGQG.jpg',
        '/home/ubuntu/upload/search_images/HyzwjYFEe3tv.jpg',
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
    'PIZZAS DOCES': [
        '/home/ubuntu/upload/search_images/7BRAt5PWA33J.jpg',
        '/home/ubuntu/upload/search_images/4mVtIr2hPI0h.jpg',
    ],
}

def copiar_imagem_unica(imagem_origem, produto_id, produto_nome):
    """Copia imagem com nome único baseado no ID do produto"""
    if not os.path.exists(imagem_origem):
        return None
    
    extensao = os.path.splitext(imagem_origem)[1]
    if extensao == '.webp':
        extensao = '.jpg'
    
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
    
    cursor.execute("SELECT id, nome FROM esfiha WHERE categoria = ? ORDER BY id", (categoria,))
    produtos = cursor.fetchall()
    
    if not produtos:
        conn.close()
        return 0
    
    print(f"\n{categoria}: {len(produtos)} produtos")
    print("-" * 80)
    
    atualizados = 0
    
    for i, (produto_id, produto_nome) in enumerate(produtos):
        imagem_origem = imagens[i % len(imagens)]
        nova_url = copiar_imagem_unica(imagem_origem, produto_id, produto_nome)
        
        if nova_url:
            cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", (nova_url, produto_id))
            atualizados += 1
            if i < 3:
                print(f"  ✓ {produto_nome[:60]}")
    
    if len(produtos) > 3:
        print(f"  ... e mais {len(produtos) - 3} produtos")
    
    conn.commit()
    conn.close()
    
    return atualizados

def main():
    print("=" * 80)
    print("DISTRIBUINDO IMAGENS PARA TODAS AS CATEGORIAS")
    print("=" * 80)
    
    total_atualizados = 0
    categorias_processadas = 0
    
    for categoria, imagens in IMAGENS_POR_CATEGORIA.items():
        atualizados = atualizar_categoria(categoria, imagens)
        if atualizados > 0:
            total_atualizados += atualizados
            categorias_processadas += 1
    
    print("\n" + "=" * 80)
    print(f"RESULTADO FINAL:")
    print(f"  - Categorias processadas: {categorias_processadas}")
    print(f"  - Produtos atualizados: {total_atualizados}")
    print("=" * 80)

if __name__ == "__main__":
    main()
