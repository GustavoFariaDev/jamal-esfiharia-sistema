import sqlite3
import os
import shutil
from pathlib import Path

# Conectar ao banco de dados
conn = sqlite3.connect('instance/jamal.db')
cursor = conn.cursor()

# Mapeamento de categorias para imagens
imagens_por_categoria = {
    'PIZZAS SALGADAS': 'g2e8fBLK8qvr.jpg',  # Pizza salgada
    'PIZZAS DOCES': 'uLfLOEdpAJM7.jpg',  # Pizza doce chocolate morango
    'ESFIHAS SALGADAS': 'WmuxWq6mlUpB.jpeg',  # Esfiha árabe
    'ESFIHAS DOCES': 'uLfLOEdpAJM7.jpg',  # Pizza doce (similar)
    'ESFIHAS ESPECIAIS': 'WmuxWq6mlUpB.jpeg',  # Esfiha árabe
    'ESFIHAS VEGETARIANAS': 'WmuxWq6mlUpB.jpeg',  # Esfiha árabe
    'FOGAZZES SALGADAS': 'EO78xyGFF9AN.jpg',  # Fogazza italiana
    'FOGAZZES DOCES': 'uLfLOEdpAJM7.jpg',  # Pizza doce
    'FOGAZZES ESPECIAIS': 'EO78xyGFF9AN.jpg',  # Fogazza italiana
    'FOGAZZES VEGETARIANAS': 'EO78xyGFF9AN.jpg',  # Fogazza italiana
    'PASTÉIS SALGADOS': 'd0VYWJmhxSSG.jpg',  # Pastel frito
    'PASTÉIS DOCES': 'd0VYWJmhxSSG.jpg',  # Pastel frito
    'PASTÉIS ESPECIAIS': 'd0VYWJmhxSSG.jpg',  # Pastel frito
    'PASTÉIS VEGETARIANOS': 'd0VYWJmhxSSG.jpg',  # Pastel frito
    'SALGADOS': 'ZoxBHGCwFhkL.jpg',  # Salgados brasileiros
    'BATATA RECHEADA': '5gtSuCltDJOM.jpg',  # Batata recheada
    'BATATA SIMPLES': '5gtSuCltDJOM.jpg',  # Batata recheada
    'BEBIDAS': 'gid1RWC0qHuU.jpg',  # Coca-cola lata
    'BEIRUTES': 'Sz4B364hFQmC.jpg',  # Beirute
}

# Buscar todos os produtos
cursor.execute("SELECT id, nome, categoria, imagem_url FROM esfiha ORDER BY id")
produtos = cursor.fetchall()

contador = 0
for prod in produtos:
    id_prod, nome, categoria, imagem_url = prod
    
    if imagem_url:
        # Verificar se o arquivo existe
        caminho = imagem_url.replace('/static/', 'static/')
        
        if not os.path.exists(caminho):
            # Produto sem arquivo físico
            imagem_generica = imagens_por_categoria.get(categoria)
            
            if imagem_generica:
                origem = f'static/uploads/{imagem_generica}'
                
                if os.path.exists(origem):
                    # Copiar a imagem genérica com o nome esperado
                    nome_arquivo = os.path.basename(caminho)
                    destino = f'static/uploads/{nome_arquivo}'
                    
                    try:
                        shutil.copy2(origem, destino)
                        contador += 1
                        print(f"✓ ID {id_prod}: {nome} ({categoria}) -> {nome_arquivo}")
                    except Exception as e:
                        print(f"✗ Erro ao copiar para ID {id_prod}: {e}")

print(f"\n✅ Total de imagens adicionadas: {contador}")

conn.close()
