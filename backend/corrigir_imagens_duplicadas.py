#!/usr/bin/env python3
"""
Script para corrigir imagens duplicadas - Foco nos casos críticos
"""

import sqlite3
import os
import shutil
from datetime import datetime

# Diretório de uploads
UPLOAD_DIR = "/home/ubuntu/jamal_sistema/jamal_live_melhorado/backend/static/uploads"

# Mapeamento de imagens para produtos específicos
CORRECOES = {
    # BATATAS - usar imagens diferentes
    'BATATA FRITA GRANDE': '/home/ubuntu/upload/search_images/aouGOs4xrjH2.jpg',
    'BATATA FRITA PEQUENA': '/home/ubuntu/upload/search_images/hj8VqntqOGLc.jpg',
    
    # BEIRUTES - usar imagens diferentes  
    'AGADIR': '/home/ubuntu/upload/search_images/tnDwc46sRXIL.jpg',
    'ALADIM': '/home/ubuntu/upload/search_images/PqzvxQZDH83J.jpg',
    'BRÓCOLIS': '/home/ubuntu/upload/search_images/t4mD7q68XmbU.jpg',
    'DA CASA': '/home/ubuntu/upload/search_images/Y9SCzRVO3nh1.jpg',
    'EGÍPCIO': '/home/ubuntu/upload/search_images/tnDwc46sRXIL.jpg',
    'FAQUIR': '/home/ubuntu/upload/search_images/PqzvxQZDH83J.jpg',
}

def copiar_e_atualizar(produto_nome, imagem_origem, categoria_filtro=None):
    """Copia imagem e atualiza no banco de dados"""
    if not os.path.exists(imagem_origem):
        print(f"❌ Imagem não encontrada: {imagem_origem}")
        return False
    
    # Conectar ao banco
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    # Buscar produto
    if categoria_filtro:
        cursor.execute("SELECT id, categoria FROM esfiha WHERE nome = ? AND categoria = ?", 
                      (produto_nome, categoria_filtro))
    else:
        cursor.execute("SELECT id, categoria FROM esfiha WHERE nome = ?", (produto_nome,))
    
    resultado = cursor.fetchone()
    
    if not resultado:
        print(f"❌ Produto não encontrado: {produto_nome}")
        conn.close()
        return False
    
    produto_id, categoria = resultado
    
    # Criar nome único para o arquivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    extensao = os.path.splitext(imagem_origem)[1]
    nome_arquivo = f"{produto_nome.lower().replace(' ', '_').replace('/', '_')}_{timestamp}{extensao}"
    destino = os.path.join(UPLOAD_DIR, nome_arquivo)
    
    try:
        # Copiar imagem
        shutil.copy2(imagem_origem, destino)
        
        # Atualizar banco de dados
        nova_url = f"/static/uploads/{nome_arquivo}"
        cursor.execute("UPDATE esfiha SET imagem_url = ? WHERE id = ?", (nova_url, produto_id))
        conn.commit()
        
        print(f"✓ {produto_nome} -> {nome_arquivo}")
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao processar {produto_nome}: {e}")
        conn.close()
        return False

def main():
    print("=" * 80)
    print("CORRIGINDO IMAGENS DUPLICADAS - CASOS CRÍTICOS")
    print("=" * 80)
    
    sucessos = 0
    falhas = 0
    
    for produto_nome, imagem_origem in CORRECOES.items():
        # Determinar categoria baseada no nome do produto
        categoria = None
        if 'BATATA' in produto_nome:
            if 'RECHEADA' in produto_nome:
                categoria = 'BATATA RECHEADA'
            else:
                categoria = 'BATATA SIMPLES'
        elif produto_nome in ['AGADIR', 'ALADIM', 'BRÓCOLIS', 'DA CASA', 'EGÍPCIO', 'FAQUIR']:
            categoria = 'BEIRUTES'
        
        if copiar_e_atualizar(produto_nome, imagem_origem, categoria):
            sucessos += 1
        else:
            falhas += 1
    
    print("\n" + "=" * 80)
    print(f"RESULTADO: {sucessos} sucessos, {falhas} falhas")
    print("=" * 80)

if __name__ == "__main__":
    main()
