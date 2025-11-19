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
    'ALHO C/ CATUPIRY': 15.50,
    'ALHO C/ MUSSARELA': 13.00,
    'ALICHE C/ CATUPIRY': 14.00,
    'ALICHE C/ MUSSARELA': 13.50,
    'ATUM': 13.00,
    'ATUM C/ CATUPIRY': 15.50,
    'ATUM C/ CHEDDAR': 13.50,
    'ATUM C/ MUSSARELA': 15.00,
    'ATUM C/ QUEIJO FRESCO': 13.00,
    'BACON C/ CATUPIRY': 14.00,
    'BACON C/ CHEDDAR': 12.50,
    'BACON C/ MUSSARELA': 13.00,
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
