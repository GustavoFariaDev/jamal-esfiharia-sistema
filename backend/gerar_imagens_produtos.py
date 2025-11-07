#!/usr/bin/env python3
"""
Script para gerar imagens únicas para cada produto usando IA
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_produtos_por_categoria():
    """Busca todos os produtos agrupados por categoria"""
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, nome, categoria, descricao, imagem_url
        FROM esfiha
        ORDER BY categoria, nome
    """)
    
    produtos = cursor.fetchall()
    conn.close()
    
    # Agrupar por categoria
    por_categoria = {}
    for prod in produtos:
        prod_id, nome, categoria, descricao, imagem_url = prod
        if categoria not in por_categoria:
            por_categoria[categoria] = []
        por_categoria[categoria].append({
            'id': prod_id,
            'nome': nome,
            'categoria': categoria,
            'descricao': descricao,
            'imagem_url': imagem_url
        })
    
    return por_categoria

def criar_prompt_imagem(produto):
    """Cria um prompt descritivo para geração de imagem"""
    nome = produto['nome']
    categoria = produto['categoria']
    descricao = produto['descricao']
    
    # Mapeamento de categorias para descrições visuais
    descricoes_categoria = {
        'PIZZAS SALGADAS': 'pizza salgada brasileira redonda com borda, vista de cima, fundo branco limpo',
        'PIZZAS DOCES': 'pizza doce brasileira redonda com cobertura, vista de cima, fundo branco limpo',
        'BEIRUTES': 'sanduíche beirute árabe cortado ao meio mostrando recheio, em prato branco, fundo limpo',
        'ESFIHAS SALGADAS': 'esfiha árabe aberta salgada com recheio visível, formato triangular, em prato branco',
        'ESFIHAS DOCES': 'esfiha árabe doce com cobertura, formato triangular, em prato branco',
        'ESFIHAS VEGETARIANAS': 'esfiha vegetariana com legumes frescos, formato triangular, em prato branco',
        'ESFIHAS ESPECIAIS': 'esfiha especial gourmet com recheio premium, formato triangular, em prato branco',
        'PASTÉIS SALGADOS': 'pastel brasileiro frito dourado salgado, em prato branco, fundo limpo',
        'PASTÉIS DOCES': 'pastel brasileiro frito dourado doce com açúcar, em prato branco',
        'PASTÉIS VEGETARIANOS': 'pastel vegetariano com legumes, dourado, em prato branco',
        'PASTÉIS ESPECIAIS': 'pastel especial gourmet, dourado, em prato branco',
        'FOGAZZES SALGADAS': 'fogazza italiana recheada salgada, cortada mostrando recheio, em prato branco',
        'FOGAZZES DOCES': 'fogazza doce com cobertura, cortada, em prato branco',
        'FOGAZZES VEGETARIANAS': 'fogazza vegetariana com legumes, cortada, em prato branco',
        'FOGAZZES ESPECIAIS': 'fogazza especial gourmet, cortada mostrando recheio, em prato branco',
        'BATATA SIMPLES': 'porção de batatas fritas crocantes douradas em prato branco, fundo limpo',
        'BATATA RECHEADA': 'porção de batatas fritas com cobertura e recheio, em prato branco',
        'SALGADOS': 'salgados brasileiros fritos variados, coxinha, bolinho, em prato branco',
    }
    
    base_prompt = descricoes_categoria.get(categoria, 'comida brasileira em prato branco, fundo limpo')
    
    # Adicionar detalhes específicos do produto
    prompt = f"Professional food photography: {base_prompt}, {nome.lower()}"
    
    if descricao and descricao != "Delicioso produto preparado com ingredientes frescos":
        # Adicionar ingredientes da descrição
        prompt += f", with {descricao.lower()}"
    
    prompt += ", high quality, appetizing, well lit, restaurant style"
    
    return prompt

def main():
    print("=" * 80)
    print("ANÁLISE DE PRODUTOS PARA GERAÇÃO DE IMAGENS")
    print("=" * 80)
    
    produtos_por_categoria = get_produtos_por_categoria()
    
    total_produtos = sum(len(prods) for prods in produtos_por_categoria.values())
    print(f"\nTotal de produtos: {total_produtos}")
    print(f"Categorias: {len(produtos_por_categoria)}\n")
    
    # Listar produtos por categoria
    for categoria, produtos in sorted(produtos_por_categoria.items()):
        print(f"\n{categoria} ({len(produtos)} produtos):")
        print("-" * 80)
        for i, prod in enumerate(produtos[:5], 1):  # Mostrar apenas os 5 primeiros
            prompt = criar_prompt_imagem(prod)
            print(f"  {i}. {prod['nome']}")
            print(f"     Prompt: {prompt[:100]}...")
        if len(produtos) > 5:
            print(f"  ... e mais {len(produtos) - 5} produtos")
    
    print("\n" + "=" * 80)
    print(f"TOTAL: {total_produtos} imagens precisam ser geradas")
    print("=" * 80)
    
    # Salvar lista de prompts em arquivo
    with open('prompts_imagens.txt', 'w', encoding='utf-8') as f:
        for categoria, produtos in sorted(produtos_por_categoria.items()):
            f.write(f"\n{'='*80}\n")
            f.write(f"{categoria}\n")
            f.write(f"{'='*80}\n\n")
            for prod in produtos:
                prompt = criar_prompt_imagem(prod)
                f.write(f"ID: {prod['id']}\n")
                f.write(f"Nome: {prod['nome']}\n")
                f.write(f"Prompt: {prompt}\n")
                f.write(f"Imagem atual: {prod['imagem_url']}\n")
                f.write(f"{'-'*80}\n")
    
    print("\nLista de prompts salva em: prompts_imagens.txt")

if __name__ == "__main__":
    main()
