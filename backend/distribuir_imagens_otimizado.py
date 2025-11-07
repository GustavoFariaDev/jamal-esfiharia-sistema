#!/usr/bin/env python3
"""
Script otimizado para distribuir imagens de forma inteligente
Garante máxima variedade possível com as imagens disponíveis
"""

import sqlite3
import os
import shutil
import glob
from collections import defaultdict

UPLOAD_DIR = "/home/ubuntu/jamal_sistema/jamal_live_melhorado/backend/static/uploads"
IMAGENS_DIR = "/home/ubuntu/upload/search_images/"

# Mapeamento de imagens por tipo de produto
MAPEAMENTO_IMAGENS = {
    # Esfihas salgadas - usar imagens de esfihas
    'esfiha_salgada': [
        '8Tsy2fotYkoZ.jpg', 'aoVYcOZFdDwp.jpg', '9VkmZYCrlb3q.jpg',
        'TXB9Vuzx6l8W.webp', 'VroUdSgAZNsG.jpg', 'OwGk26vUGfC2.jpg'
    ],
    # Esfihas doces
    'esfiha_doce': [
        'LSYjt4QUpndn.jpg', 'O4gn2zJ2ZoAw.jpeg', 'i3CfSUkSCk3Q.jpg'
    ],
    # Pastéis
    'pastel': [
        'pbZmC6bygzCt.png', 'njvcFSaVAmuW.jpg', 'C0aRoCw1ITgU.jpg',
        'TKp3qNJKgGKq.jpg', 'VPjNe84xSc5H.jpg', 'bARNcZ2tW2Ty.jpg'
    ],
    # Fogazzes
    'fogazza': [
        'SMJxGVXnVZlf.jpg', 'goXuHfimHSRj.jpg', 'zj6lIp37bOAo.jpeg',
        'gU9rsPa8qGQG.jpg', 'HyzwjYFEe3tv.jpg', 'skn3L6233x9M.jpg'
    ],
    # Pizzas
    'pizza': [
        '7BRAt5PWA33J.jpg', '4mVtIr2hPI0h.jpg', 'S4zxQRsO4obI.jpg',
        'uy30vJFSkIrN.jpg', '455vzx64RE5k.jpg', 'TNChVO6b4Uwj.png'
    ],
    # Beirutes
    'beirute': [
        'PqzvxQZDH83J.jpg', 'Y9SCzRVO3nh1.jpg', 't4mD7q68XmbU.jpg',
        'tnDwc46sRXIL.jpg', 'wMmGAmWAhucx.jpg', 'ht5v9n7v9wBE.jpg'
    ],
    # Salgados
    'salgado': [
        'jWzjN5zYLrMD.jpg', 'KKDh8z7LjXu2.jpg', 'A1Mu3b1P8CH0.jpg',
        'u95kH0FU6BO4.jpg', '4z5DNHSqScGt.jpg'
    ],
    # Batatas
    'batata': [
        'hj8VqntqOGLc.jpg', 'aouGOs4xrjH2.jpg', 'n36z1mArZyMy.jpg',
        'L8H8Tph3O6OF.webp'
    ]
}

def identificar_tipo_produto(categoria, nome):
    """Identifica o tipo de produto para escolher imagens apropriadas"""
    categoria_lower = categoria.lower()
    nome_lower = nome.lower()
    
    if 'pizza' in categoria_lower:
        return 'pizza'
    elif 'beirute' in categoria_lower:
        return 'beirute'
    elif 'esfiha' in categoria_lower:
        if 'doce' in categoria_lower or any(x in nome_lower for x in ['chocolate', 'banana', 'brigadeiro', 'doce']):
            return 'esfiha_doce'
        return 'esfiha_salgada'
    elif 'pastel' in categoria_lower or 'pastéis' in categoria_lower:
        return 'pastel'
    elif 'fogaz' in categoria_lower:
        return 'fogazza'
    elif 'batata' in categoria_lower:
        return 'batata'
    elif 'salgado' in categoria_lower:
        return 'salgado'
    
    return 'esfiha_salgada'  # Default

def copiar_imagem_unica(imagem_nome, produto_id, produto_nome):
    """Copia imagem com nome único"""
    origem = os.path.join(IMAGENS_DIR, imagem_nome)
    
    if not os.path.exists(origem):
        return None
    
    extensao = os.path.splitext(imagem_nome)[1]
    if extensao == '.webp':
        extensao = '.jpg'
    
    nome_arquivo = f"prod_{produto_id}_{produto_nome[:20].lower().replace(' ', '_').replace('/', '_')}{extensao}"
    destino = os.path.join(UPLOAD_DIR, nome_arquivo)
    
    try:
        shutil.copy2(origem, destino)
        return f"/static/uploads/{nome_arquivo}"
    except Exception as e:
        return None

def processar_todos_produtos():
    """Processa todos os produtos de forma inteligente"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    # Buscar todos os produtos
    cursor.execute("SELECT id, nome, categoria FROM esfiha ORDER BY categoria, id")
    produtos = cursor.fetchall()
    
    print(f"\nTotal de produtos: {len(produtos)}")
    print("=" * 80)
    
    # Agrupar por tipo
    por_tipo = defaultdict(list)
    for produto_id, nome, categoria in produtos:
        tipo = identificar_tipo_produto(categoria, nome)
        por_tipo[tipo].append((produto_id, nome, categoria))
    
    atualizados = 0
    
    for tipo, produtos_tipo in por_tipo.items():
        imagens = MAPEAMENTO_IMAGENS.get(tipo, MAPEAMENTO_IMAGENS['esfiha_salgada'])
        
        print(f"\n{tipo.upper()}: {len(produtos_tipo)} produtos, {len(imagens)} imagens")
        print("-" * 80)
        
        for i, (produto_id, nome, categoria) in enumerate(produtos_tipo):
            # Distribuir imagens de forma cíclica
            imagem_nome = imagens[i % len(imagens)]
            nova_url = copiar_imagem_unica(imagem_nome, produto_id, nome)
            
            if nova_url:
                cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", 
                              (nova_url, produto_id))
                atualizados += 1
                if i < 3:
                    print(f"  ✓ {nome[:60]}")
        
        if len(produtos_tipo) > 3:
            print(f"  ... e mais {len(produtos_tipo) - 3} produtos")
    
    conn.commit()
    conn.close()
    
    return atualizados

def main():
    print("=" * 80)
    print("DISTRIBUIÇÃO OTIMIZADA DE IMAGENS")
    print("=" * 80)
    
    total = processar_todos_produtos()
    
    print("\n" + "=" * 80)
    print(f"✓ CONCLUÍDO: {total} produtos atualizados")
    print("=" * 80)

if __name__ == "__main__":
    main()
