#!/usr/bin/env python3
"""
Script para atualizar imagens dos produtos no banco de dados
Busca imagens apropriadas baseadas no nome e categoria do produto
"""

import sqlite3
import os
import shutil
from pathlib import Path

# Mapeamento de imagens para produtos específicos
IMAGENS_BATATAS = {
    'BATATA FRITA GRANDE': '/home/ubuntu/upload/search_images/aouGOs4xrjH2.jpg',
    'BATATA FRITA PEQUENA': '/home/ubuntu/upload/search_images/hj8VqntqOGLc.jpg',
    'BATATA FRITA RECHEADA GRANDE': '/home/ubuntu/upload/search_images/n36z1mArZyMy.jpg',
    'BATATA FRITA RECHEADA PEQUENA': '/home/ubuntu/upload/search_images/aouGOs4xrjH2.jpg',
}

IMAGENS_BEIRUTES = {
    'AGADIR': '/home/ubuntu/upload/search_images/tnDwc46sRXIL.jpg',
    'ALADIM': '/home/ubuntu/upload/search_images/PqzvxQZDH83J.jpg',
    'BRÓCOLIS': '/home/ubuntu/upload/search_images/t4mD7q68XmbU.jpg',
    'DA CASA': '/home/ubuntu/upload/search_images/Y9SCzRVO3nh1.jpg',
    'EGÍPCIO': '/home/ubuntu/upload/search_images/tnDwc46sRXIL.jpg',
    'FAQUIR': '/home/ubuntu/upload/search_images/PqzvxQZDH83J.jpg',
}

def copiar_imagem(origem, produto_nome, categoria):
    """Copia imagem para o diretório de uploads com nome único"""
    if not os.path.exists(origem):
        print(f"Imagem não encontrada: {origem}")
        return None
    
    # Criar nome de arquivo único
    extensao = Path(origem).suffix
    nome_arquivo = f"{produto_nome.lower().replace(' ', '_').replace('/', '_')}_{categoria.lower().replace(' ', '_')}{extensao}"
    destino = f"/home/ubuntu/jamal_sistema/jamal_live_melhorado/backend/static/uploads/{nome_arquivo}"
    
    try:
        shutil.copy2(origem, destino)
        return f"/static/uploads/{nome_arquivo}"
    except Exception as e:
        print(f"Erro ao copiar imagem: {e}")
        return None

def atualizar_batatas():
    """Atualiza imagens dos produtos de batata"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    for produto_nome, imagem_origem in IMAGENS_BATATAS.items():
        cursor.execute("SELECT id, categoria FROM esfiha WHERE nome = ?", (produto_nome,))
        resultado = cursor.fetchone()
        
        if resultado:
            produto_id, categoria = resultado
            nova_imagem = copiar_imagem(imagem_origem, produto_nome, categoria)
            
            if nova_imagem:
                cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", (nova_imagem, produto_id))
                print(f"✓ Atualizado: {produto_nome} -> {nova_imagem}")
    
    conn.commit()
    conn.close()

def atualizar_beirutes():
    """Atualiza imagens dos beirutes"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    for produto_nome, imagem_origem in IMAGENS_BEIRUTES.items():
        cursor.execute("SELECT id, categoria FROM esfiha WHERE nome = ? AND categoria = 'BEIRUTES'", (produto_nome,))
        resultado = cursor.fetchone()
        
        if resultado:
            produto_id, categoria = resultado
            nova_imagem = copiar_imagem(imagem_origem, produto_nome, categoria)
            
            if nova_imagem:
                cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", (nova_imagem, produto_id))
                print(f"✓ Atualizado: {produto_nome} -> {nova_imagem}")
    
    conn.commit()
    conn.close()

def main():
    print("=" * 60)
    print("ATUALIZANDO IMAGENS DOS PRODUTOS")
    print("=" * 60)
    
    print("\n1. Atualizando batatas...")
    atualizar_batatas()
    
    print("\n2. Atualizando beirutes...")
    atualizar_beirutes()
    
    print("\n" + "=" * 60)
    print("ATUALIZAÇÃO CONCLUÍDA!")
    print("=" * 60)

if __name__ == "__main__":
    main()
