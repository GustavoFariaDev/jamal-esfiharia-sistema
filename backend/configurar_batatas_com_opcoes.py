#!/usr/bin/env python3
"""
Script para configurar batatas recheadas com sistema de opções de recheio
Similar ao sistema de pizzas com "Ver Opções"
"""
import os
import sys

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha
from src.models.acrescimo import Acrescimo

def configurar_batatas_opcoes():
    """
    Configura batatas recheadas para aparecerem com botão "Ver Opções"
    """
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("CONFIGURANDO BATATAS COM SISTEMA DE OPÇÕES")
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
        
        # 2. Criar batatas com preços por tamanho
        print("\n➕ Criando batatas com sistema de opções...")
        
        # BATATA RECHEADA (com 2 tamanhos)
        batata_recheada = Esfiha(
            nome="BATATA FRITA RECHEADA",
            descricao="Deliciosa porção de batatas fritas recheadas. Escolha seu recheio favorito!",
            preco=35.00,  # Preço base (pequena)
            preco_broto=None,  # Não usa broto
            preco_media=35.00,  # Pequena
            preco_grande=45.00,  # Grande
            categoria="BATATA RECHEADA",
            disponivel=True,
            imagem_url=None
        )
        db.session.add(batata_recheada)
        db.session.flush()
        
        print(f"   ✅ Criada: {batata_recheada.nome}")
        print(f"      Pequena: R$ {batata_recheada.preco_media:.2f}")
        print(f"      Grande: R$ {batata_recheada.preco_grande:.2f}")
        
        # 3. Criar acréscimos de recheio (preço R$ 0,00 pois já está incluído)
        print("\n➕ Criando opções de recheio...")
        
        # Verificar se já existem
        recheio1 = Acrescimo.query.filter_by(
            nome="Calabresa e Mussarela",
            tipo="batata_recheio"
        ).first()
        
        if not recheio1:
            recheio1 = Acrescimo(
                nome="Calabresa e Mussarela",
                preco=0.00,  # Preço já incluído na batata
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
                preco=0.00,  # Preço já incluído na batata
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
        print("✅ Batata configurada com 2 tamanhos:")
        print("   • BATATA FRITA RECHEADA")
        print("     - Pequena: R$ 35,00")
        print("     - Grande: R$ 45,00")
        print()
        print("✅ Opções de recheio criadas:")
        print("   1. Calabresa e Mussarela")
        print("   2. Bacon e Cheddar")
        print()
        print("🎯 Como funciona:")
        print("   • Cliente clica em 'Ver Opções'")
        print("   • Escolhe o tamanho (Pequena ou Grande)")
        print("   • Escolhe o recheio (Calabresa ou Bacon)")
        print()
        print("=" * 60)
        print("CONCLUÍDO COM SUCESSO!")
        print("=" * 60)

if __name__ == '__main__':
    configurar_batatas_opcoes()
