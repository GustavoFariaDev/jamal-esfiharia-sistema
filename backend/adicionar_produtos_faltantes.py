#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para adicionar produtos faltantes no banco de dados
Produtos identificados pela comparação entre gestão e cardápio
"""

import os
import sys
from datetime import datetime

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

# Produtos faltantes identificados
produtos_faltantes = [
    {
        'nome': 'PEITO DE PERU C/ MUSSARELA',
        'descricao': 'Esfiha de peito de peru com mussarela',
        'preco': 14.00,
        'categoria': 'carnes',
        'disponivel': True
    },
    {
        'nome': 'PEITO DE PERU C/ CATUPIRY',
        'descricao': 'Esfiha de peito de peru com catupiry',
        'preco': 15.00,
        'categoria': 'carnes',
        'disponivel': True
    },
    {
        'nome': 'PEITO DE PERU C/ CHEDDAR',
        'descricao': 'Esfiha de peito de peru com cheddar',
        'preco': 13.00,
        'categoria': 'carnes',
        'disponivel': True
    },
    {
        'nome': 'PEITO DE PERU C/ QUEIJO FRESCO',
        'descricao': 'Esfiha de peito de peru com queijo fresco',
        'preco': 15.00,
        'categoria': 'carnes',
        'disponivel': True
    },
    {
        'nome': 'QUATRO QUEIJOS',
        'descricao': 'Esfiha com quatro tipos de queijo',
        'preco': 17.00,
        'categoria': 'queijos',
        'disponivel': True
    }
]

def adicionar_produtos():
    """Adiciona os produtos faltantes no banco de dados"""
    app = create_app()
    
    with app.app_context():
        print("=" * 80)
        print("ADICIONANDO PRODUTOS FALTANTES - JAMAL ESFIHARIA")
        print("=" * 80)
        print()
        
        produtos_adicionados = 0
        produtos_existentes = 0
        
        for produto_data in produtos_faltantes:
            # Verificar se o produto já existe
            produto_existente = Esfiha.query.filter_by(nome=produto_data['nome']).first()
            
            if produto_existente:
                print(f"⚠️  Produto já existe: {produto_data['nome']}")
                produtos_existentes += 1
                continue
            
            # Criar novo produto
            try:
                novo_produto = Esfiha(
                    nome=produto_data['nome'],
                    descricao=produto_data['descricao'],
                    preco=produto_data['preco'],
                    preco_broto=None,
                    preco_media=None,
                    preco_grande=None,
                    categoria=produto_data['categoria'],
                    disponivel=produto_data['disponivel'],
                    imagem_url=''
                )
                
                db.session.add(novo_produto)
                db.session.commit()
                
                print(f"✅ Produto adicionado: {produto_data['nome']} - R$ {produto_data['preco']:.2f}")
                produtos_adicionados += 1
                
            except Exception as e:
                db.session.rollback()
                print(f"❌ Erro ao adicionar {produto_data['nome']}: {str(e)}")
        
        print()
        print("=" * 80)
        print("RESUMO DA OPERAÇÃO")
        print("=" * 80)
        print(f"✅ Produtos adicionados: {produtos_adicionados}")
        print(f"⚠️  Produtos já existentes: {produtos_existentes}")
        print(f"📊 Total processado: {len(produtos_faltantes)}")
        print("=" * 80)
        
        # Verificar total de produtos no banco
        total_produtos = Esfiha.query.count()
        print(f"\n📦 Total de produtos no banco de dados: {total_produtos}")
        print()

if __name__ == '__main__':
    adicionar_produtos()
