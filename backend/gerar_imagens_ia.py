#!/usr/bin/env python3
"""
Script para gerar imagens com IA para produtos especiais
"""

import sqlite3
import json

def obter_produtos_especiais():
    """Obtém lista de produtos especiais para gerar com IA"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, nome, categoria, descricao
    FROM esfiha 
    WHERE categoria LIKE '%ESPECIAIS%' 
       OR categoria = 'BEIRUTES'
       OR nome LIKE '%FILÉ%'
       OR nome LIKE '%CARNE SECA%'
       OR nome LIKE '%GORGONZOLA%'
       OR preco > 15
    ORDER BY categoria, id
    """)
    
    produtos = cursor.fetchall()
    conn.close()
    
    return produtos

def criar_prompt_produto(nome, categoria, descricao):
    """Cria prompt detalhado para geração de imagem"""
    
    # Mapear categoria para tipo de produto
    tipo_base = ""
    if "ESFIHA" in categoria:
        tipo_base = "esfiha árabe aberta"
    elif "PIZZA" in categoria:
        tipo_base = "pizza brasileira"
    elif "BEIRUTE" in categoria:
        tipo_base = "beirute sandwich árabe"
    elif "PASTEL" in categoria:
        tipo_base = "pastel brasileiro frito"
    elif "FOGAZ" in categoria:
        tipo_base = "focaccia recheada"
    elif "BATATA" in categoria:
        tipo_base = "batata frita"
    else:
        tipo_base = "comida árabe"
    
    # Extrair ingredientes do nome
    ingredientes = nome.lower()
    
    # Criar prompt rico
    prompt = f"Professional food photography of {tipo_base}, "
    
    # Adicionar detalhes dos ingredientes
    if "carne seca" in ingredientes:
        prompt += "topped with shredded dried beef and creamy catupiry cheese, "
    elif "filé" in ingredientes or "mignon" in ingredientes:
        prompt += "with premium filet mignon and gorgonzola cheese, "
    elif "gorgonzola" in ingredientes:
        prompt += "with melted gorgonzola cheese, "
    elif "catupiry" in ingredientes:
        prompt += "with creamy catupiry cheese, "
    elif "mussarela" in ingredientes:
        prompt += "with melted mozzarella cheese, "
    elif "calabresa" in ingredientes:
        prompt += "with spicy calabresa sausage, "
    elif "frango" in ingredientes or "chicken" in ingredientes:
        prompt += "with seasoned chicken, "
    
    # Adicionar contexto visual
    prompt += "beautifully plated on rustic wooden board, "
    prompt += "garnished with fresh herbs, "
    prompt += "warm lighting, shallow depth of field, "
    prompt += "appetizing presentation, high resolution, "
    prompt += "professional culinary photography style"
    
    return prompt

def main():
    produtos = obter_produtos_especiais()
    
    print(f"Total de produtos especiais: {len(produtos)}")
    print("\nPrimeiros 10 produtos:")
    
    resultado = []
    
    for i, (produto_id, nome, categoria, descricao) in enumerate(produtos[:10]):
        prompt = criar_prompt_produto(nome, categoria, descricao)
        
        resultado.append({
            "id": produto_id,
            "nome": nome,
            "categoria": categoria,
            "prompt": prompt
        })
        
        print(f"\n{i+1}. {nome} ({categoria})")
        print(f"   Prompt: {prompt[:100]}...")
    
    # Salvar lista completa
    todos_produtos = []
    for produto_id, nome, categoria, descricao in produtos:
        prompt = criar_prompt_produto(nome, categoria, descricao)
        todos_produtos.append({
            "id": produto_id,
            "nome": nome,
            "categoria": categoria,
            "prompt": prompt
        })
    
    with open('/home/ubuntu/jamal_sistema/produtos_especiais_ia.json', 'w', encoding='utf-8') as f:
        json.dump(todos_produtos, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Lista completa salva em produtos_especiais_ia.json ({len(todos_produtos)} produtos)")

if __name__ == "__main__":
    main()
