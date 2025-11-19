#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corrigir preços dos Pastéis Salgados
Atualiza os preços no banco de dados com os valores corretos do cardápio
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

# Preços corretos extraídos do cardápio físico
precos_corretos = {
    'ALHO C/ MUSSARELA': 13.00,
    'ALHO C/ CATUPIRY': 15.50,
    'ALICHE C/ MUSSARELA': 13.50,
    'ALICHE C/ CATUPIRY': 14.00,
    'ATUM': 13.00,
    'ATUM C/ MUSSARELA': 15.00,
    'ATUM C/ CATUPIRY': 15.50,
    'ATUM C/ CHEDDAR': 13.50,
    'ATUM C/ QUEIJO FRESCO': 13.00,
    'BAIANA': 15.00,
    'BAURU': 13.00,
    'BACON C/ MUSSARELA': 13.00,
    'BACON C/ CATUPIRY': 14.00,
    'BACON C/ CHEDDAR': 12.50,
    'BERINJELA C/ MUSSARELA E BACON': 15.00,
    'BERINJELA C/ CATUPIRY E BACON': 15.50,
    'BERINJELA C/ MUSSARELA, CATUPIRY E BACON': 17.00,
    'BRÓCOLIS C/ MUSSARELA': 13.00,
    'BRÓCOLIS C/ CATUPIRY': 15.00,
    'BRÓCOLIS C/ BACON': 15.00,
    'BRÓCOLIS C/ MUSSARELA E BACON': 15.00,
    'BRÓCOLIS C/ CATUPIRY E BACON': 16.00,
    'CARNE': 11.50,
    'CARNE C/ MUSSARELA': 13.00,
    'CARNE C/ CATUPIRY': 13.50,
    'CARNE C/ CHEDDAR': 12.50,
    'CARNE C/ MUSSARELA E BACON': 16.00,
    'CARNE C/ CATUPIRY E BACON': 16.50,
    'CALABRESA': 11.50,
    'CALABRESA C/ MUSSARELA': 13.00,
    'CALABRESA C/ CATUPIRY': 15.00,
    'CALABRESA C/ CHEDDAR': 12.50,
    'CALABRESA C/ PROVOLONE': 15.00,
    'CHEDDAR': 11.00,
    'CATUPIRY': 12.00,
    'CARNE SECA': 13.50,
    'CARNE SECA C/ MUSSARELA': 15.50,
    'CARNE SECA C/ CATUPIRY': 16.00,
    'CARNE SECA C/ CHEDDAR': 14.00,
    'DOIS QUEIJOS': 14.00,
    'ESCAROLA': 11.00,
    'CINCO QUEIJOS': 18.00,
    'SALAME C/ MUSSARELA': 15.00,
    'SALAME C/ CATUPIRY': 16.00,
    'SALAME C/ CHEDDAR': 14.00,
    'SALAME C/ PROVOLONE': 16.50,
    'TRÊS QUEIJOS': 15.00,
    'ESCAROLA C/ MUSSARELA': 12.00,
    'ESCAROLA C/ CATUPIRY': 13.00,
    'ESCAROLA C/ CHEDDAR': 12.00,
    'ESCAROLA C/ QUEIJO FRESCO': 12.50,
    'ESCAROLA C/ MUSSARELA E BACON': 15.00,
    'ESCAROLA C/ CATUPIRY E BACON': 16.00,
    'FRANGO': 11.50,
    'FRANGO C/ MUSSARELA': 13.00,
    'FRANGO C/ CATUPIRY': 13.50,
    'FRANGO C/ CHEDDAR': 12.50,
    'FRANGO C/ MUSSARELA E MILHO': 15.00,
    'FRANGO C/ CATUPIRY E MILHO': 15.50,
    'FRANGO C/ MUSSARELA E BACON': 16.00,
    'FRANGO C/ CATUPIRY E BACON': 16.50,
    'FILÉ MIGNON C/ MUSSARELA': 17.00,
    'FILÉ MIGNON C/ CATUPIRY': 18.00,
    'FILÉ MIGNON C/ CHEDDAR': 16.00,
    'GORGONZOLA': 18.00,
    'LOMBO C/ MUSSARELA': 13.00,
    'LOMBO C/ CATUPIRY': 15.00,
    'LOMBO C/ CHEDDAR': 12.00,
    'LOMBO C/ QUEIJO FRESCO': 12.50,
    'MUSSARELA': 11.50,
    'MILHO C/ MUSSARELA': 12.50,
    'MUSSARELA C/ TOMATE SECO': 14.50,
    'MILHO C/ CATUPIRY': 14.00,
    'MARGUERITA': 14.50,
    'NAPOLITANA': 15.50,
    'PORTUGUESA': 15.00,
    'PEPPERONI C/ MUSSARELA': 15.00,
    'PEPPERONI C/ CATUPIRY': 15.50,
    'PEPPERONI C/ CHEDDAR': 14.00,
    'PIZZA': 14.00,
    'PALMITO': 11.50,
    'PALMITO C/ MUSSARELA': 12.50,
    'PALMITO C/ CATUPIRY': 13.00,
    'PALMITO C/ CHEDDAR': 12.00,
    'PROVOLONE': 15.00,
    'QUEIJO FRESCO': 12.00,
    'QUATROQUEIJOS': 17.00,
    'PEITO DE PERU C/ MUSSARELA': 14.00,
    'PEITO DE PERU C/ CATUPIR': 15.00,
    'PEITO DE PERU C/ CHEDDAR': 13.00,
    'PEITO DE PERU C/ QUEIJO FRESCO': 15.00,
}

def corrigir_precos():
    """Corrige os preços dos pastéis salgados no banco de dados"""
    app = create_app()
    
    with app.app_context():
        print("=" * 100)
        print("CORREÇÃO DE PREÇOS - PASTÉIS SALGADOS")
        print("=" * 100)
        print()
        
        produtos_corrigidos = 0
        produtos_nao_encontrados = 0
        
        for nome, preco_correto in precos_corretos.items():
            # Buscar o produto no banco
            produto = Esfiha.query.filter_by(nome=nome).first()
            
            if not produto:
                print(f"⚠️  Produto não encontrado: {nome}")
                produtos_nao_encontrados += 1
                continue
            
            preco_antigo = produto.preco
            
            # Verificar se precisa atualizar
            if abs(preco_antigo - preco_correto) < 0.01:
                print(f"✓  {nome:<40} já está correto (R$ {preco_correto:.2f})")
                continue
            
            # Atualizar o preço
            try:
                produto.preco = preco_correto
                db.session.commit()
                
                print(f"✅ {nome:<40} R$ {preco_antigo:.2f} → R$ {preco_correto:.2f}")
                produtos_corrigidos += 1
                
            except Exception as e:
                db.session.rollback()
                print(f"❌ Erro ao corrigir {nome}: {str(e)}")
        
        print()
        print("=" * 100)
        print("RESUMO DA CORREÇÃO")
        print("=" * 100)
        print(f"✅ Produtos corrigidos: {produtos_corrigidos}")
        print(f"⚠️  Produtos não encontrados: {produtos_nao_encontrados}")
        print(f"📊 Total processado: {len(precos_corretos)}")
        print("=" * 100)
        print()
        
        if produtos_corrigidos > 0:
            print("🎉 Preços atualizados com sucesso!")
        else:
            print("ℹ️  Nenhum preço precisou ser atualizado.")
        
        print()

if __name__ == '__main__':
    corrigir_precos()
