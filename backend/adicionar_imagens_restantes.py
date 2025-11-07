import sqlite3
import os
import shutil

conn = sqlite3.connect('instance/jamal.db')
cursor = conn.cursor()

# Mapeamento de categorias para imagens (atualizado)
imagens_por_categoria = {
    'PIZZAS SALGADAS': 'g2e8fBLK8qvr.jpg',
    'PIZZAS DOCES': 'uLfLOEdpAJM7.jpg',
    'ESFIHAS SALGADAS': 'WmuxWq6mlUpB.jpeg',
    'ESFIHAS DOCES': 'uLfLOEdpAJM7.jpg',
    'ESFIHAS ESPECIAIS': 'WmuxWq6mlUpB.jpeg',
    'ESFIHAS VEGETARIANAS': 'WmuxWq6mlUpB.jpeg',
    'FOGAZZES SALGADAS': 'EO78xyGFF9AN.jpg',
    'FOGAZZES DOCES': 'uLfLOEdpAJM7.jpg',
    'FOGAZZES ESPECIAIS': 'EO78xyGFF9AN.jpg',
    'FOGAZZES VEGETARIANAS': 'EO78xyGFF9AN.jpg',
    'PASTÉIS SALGADOS': 'd0VYWJmhxSSG.jpg',
    'PASTÉIS DOCES': 'd0VYWJmhxSSG.jpg',
    'PASTÉIS ESPECIAIS': 'd0VYWJmhxSSG.jpg',
    'PASTÉIS VEGETARIANOS': 'd0VYWJmhxSSG.jpg',
    'SALGADOS': 'ZoxBHGCwFhkL.jpg',
    'BATATA RECHEADA': '5gtSuCltDJOM.jpg',
    'BATATA SIMPLES': '5gtSuCltDJOM.jpg',
    'BEBIDAS': 'gid1RWC0qHuU.jpg',
    'BEIRUTES': 'Sz4B364hFQmC.jpg',
}

cursor.execute("SELECT id, nome, categoria, imagem_url FROM esfiha")
produtos = cursor.fetchall()

contador = 0
for prod in produtos:
    id_prod, nome, categoria, imagem_url = prod
    
    if imagem_url:
        caminho = imagem_url.replace('/static/', 'static/')
        
        if not os.path.exists(caminho):
            imagem_generica = imagens_por_categoria.get(categoria)
            
            if imagem_generica:
                origem = f'static/uploads/{imagem_generica}'
                
                if os.path.exists(origem):
                    nome_arquivo = os.path.basename(caminho)
                    destino = f'static/uploads/{nome_arquivo}'
                    
                    try:
                        shutil.copy2(origem, destino)
                        contador += 1
                        print(f"✓ ID {id_prod}: {nome} ({categoria})")
                    except Exception as e:
                        print(f"✗ Erro ID {id_prod}: {e}")
                else:
                    print(f"⚠ Imagem origem não encontrada: {origem}")

print(f"\n✅ Total de imagens adicionadas: {contador}")

conn.close()
