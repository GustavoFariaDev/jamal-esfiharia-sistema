#!/usr/bin/env python3
"""
Script para criar 2 produtos separados de batata recheada
BATATA FRITA RECHEADA GRANDE (R$ 45,00)
BATATA FRITA RECHEADA PEQUENA (R$ 35,00)
Com opções de recheio ao clicar em Adicionar
"""
import os
import sys

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha
from src.models.acrescimo import Acrescimo

def criar_batatas_separadas():
    """
    Cria 2 produtos separados de batata recheada
    """
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("CRIANDO BATATAS RECHEADAS SEPARADAS")
        print("=" * 60)
        
        # 1. Remover batatas antigas
        print("\n🗑️  Removendo batatas antigas...")
        batatas_antigas = Esfiha.query.filter(
            Esfiha.nome.ilike('%BATATA%RECHEADA%')
        ).all()
        
        for batata in batatas_antigas:
            print(f"   Removendo: {batata.nome}")
            db.session.delete(batata)
        
        db.session.commit()
        
        # 2. Criar 2 produtos separados
        print("\n➕ Criando produtos separados...")
        
        # BATATA GRANDE
        batata_grande = Esfiha(
            nome="BATATA FRITA RECHEADA GRANDE",
            descricao="Delicioso produto preparado com ingredientes frescos",
            preco=45.00,
            preco_broto=None,
            preco_media=None,
            preco_grande=None,
            categoria="BATATA RECHEADA",
            disponivel=True,
            imagem_url=None
        )
        db.session.add(batata_grande)
        print(f"   ✅ Criada: {batata_grande.nome} - R$ {batata_grande.preco:.2f}")
        
        # BATATA PEQUENA
        batata_pequena = Esfiha(
            nome="BATATA FRITA RECHEADA PEQUENA",
            descricao="Delicioso produto preparado com ingredientes frescos",
            preco=35.00,
            preco_broto=None,
            preco_media=None,
            preco_grande=None,
            categoria="BATATA RECHEADA",
            disponivel=True,
            imagem_url=None
        )
        db.session.add(batata_pequena)
        print(f"   ✅ Criada: {batata_pequena.nome} - R$ {batata_pequena.preco:.2f}")
        
        db.session.commit()
        
        # 3. Criar/verificar acréscimos de recheio
        print("\n➕ Verificando opções de recheio...")
        
        recheio1 = Acrescimo.query.filter_by(
            nome="Calabresa e Mussarela",
            tipo="batata_recheio"
        ).first()
        
        if not recheio1:
            recheio1 = Acrescimo(
                nome="Calabresa e Mussarela",
                preco=0.00,
                tipo="batata_recheio",
                disponivel=True
            )
            db.session.add(recheio1)
            print(f"   ✅ Criado: {recheio1.nome} (R$ 0,00 - incluído)")
        else:
            print(f"   ℹ️  Já existe: {recheio1.nome}")
        
        recheio2 = Acrescimo.query.filter_by(
            nome="Bacon e Cheddar",
            tipo="batata_recheio"
        ).first()
        
        if not recheio2:
            recheio2 = Acrescimo(
                nome="Bacon e Cheddar",
                preco=0.00,
                tipo="batata_recheio",
                disponivel=True
            )
            db.session.add(recheio2)
            print(f"   ✅ Criado: {recheio2.nome} (R$ 0,00 - incluído)")
        else:
            print(f"   ℹ️  Já existe: {recheio2.nome}")
        
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("RESUMO")
        print("=" * 60)
        print("✅ Produtos criados:")
        print("   1. BATATA FRITA RECHEADA GRANDE - R$ 45,00")
        print("   2. BATATA FRITA RECHEADA PEQUENA - R$ 35,00")
        print()
        print("✅ Opções de recheio:")
        print("   • Calabresa e Mussarela (incluído)")
        print("   • Bacon e Cheddar (incluído)")
        print()
        print("🎯 Como funciona:")
        print("   • Cliente vê 2 produtos separados")
        print("   • Clica em '+ Adicionar' no produto desejado")
        print("   • Escolhe o recheio no modal")
        print("   • Adiciona ao carrinho")
        print()
        print("=" * 60)
        print("CONCLUÍDO COM SUCESSO!")
        print("=" * 60)

if __name__ == '__main__':
    criar_batatas_separadas()
