#!/usr/bin/env python3
"""
Script para corrigir o nome do produto "5 QUEJOS" para "5 QUEIJOS"
"""
import os
import sys

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from models.esfiha import db, Esfiha

def corrigir_produto():
    """Corrige o nome do produto de 5 QUEJOS para 5 QUEIJOS"""
    try:
        # Buscar o produto com nome incorreto
        produto = Esfiha.query.filter_by(nome='5 QUEJOS').first()
        
        if produto:
            print(f"✓ Produto encontrado: ID {produto.id} - {produto.nome}")
            produto.nome = '5 QUEIJOS'
            db.session.commit()
            print(f"✓ Produto corrigido para: {produto.nome}")
            return True
        else:
            print("⚠ Produto '5 QUEJOS' não encontrado no banco de dados")
            print("Verificando se já está correto...")
            
            produto_correto = Esfiha.query.filter_by(nome='5 QUEIJOS').first()
            if produto_correto:
                print(f"✓ Produto já está correto: ID {produto_correto.id} - {produto_correto.nome}")
                return True
            else:
                print("✗ Produto não encontrado com nenhum dos nomes")
                return False
                
    except Exception as e:
        print(f"✗ Erro ao corrigir produto: {e}")
        db.session.rollback()
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Correção do nome do produto '5 QUEJOS' -> '5 QUEIJOS'")
    print("=" * 60)
    
    if corrigir_produto():
        print("\n✓ Correção concluída com sucesso!")
    else:
        print("\n✗ Falha na correção")
        sys.exit(1)
