#!/usr/bin/env python3
"""
Script para adicionar opções de recheio para batatas recheadas
- Calabresa e Mussarela
- Bacon e Cheddar
Ambas com o mesmo valor
"""
import os
import sys

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

def adicionar_opcoes_batata():
    """
    Adiciona ou atualiza as opções de batata recheada
    """
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("ADICIONANDO OPÇÕES DE RECHEIO PARA BATATAS")
        print("=" * 60)
        
        # Buscar batata recheada existente
        batata_existente = Esfiha.query.filter(
            Esfiha.nome.ilike('%BATATA%RECHEADA%')
        ).first()
        
        if batata_existente:
            print(f"\n✅ Encontrada batata recheada: {batata_existente.nome}")
            print(f"   Preço atual: R$ {batata_existente.preco:.2f}")
            preco_base = batata_existente.preco
            categoria_base = batata_existente.categoria
            imagem_base = batata_existente.imagem_url
            descricao_base = batata_existente.descricao or "Deliciosa porção de batatas fritas recheadas"
        else:
            print("\n⚠️  Nenhuma batata recheada encontrada. Usando valores padrão.")
            preco_base = 35.00  # Preço padrão
            categoria_base = "BATATA RECHEADA"
            imagem_base = None
            descricao_base = "Deliciosa porção de batatas fritas recheadas"
        
        # Definir as duas opções de recheio
        opcoes_recheio = [
            {
                "nome": "BATATA FRITA RECHEADA - CALABRESA E MUSSARELA",
                "descricao": f"{descricao_base} com calabresa e mussarela",
                "preco": preco_base,
                "categoria": categoria_base,
                "imagem_url": imagem_base
            },
            {
                "nome": "BATATA FRITA RECHEADA - BACON E CHEDDAR",
                "descricao": f"{descricao_base} com bacon e cheddar",
                "preco": preco_base,
                "categoria": categoria_base,
                "imagem_url": imagem_base
            }
        ]
        
        produtos_criados = 0
        produtos_atualizados = 0
        
        for opcao in opcoes_recheio:
            # Verificar se já existe
            produto_existente = Esfiha.query.filter_by(nome=opcao["nome"]).first()
            
            if produto_existente:
                print(f"\n🔄 Atualizando: {opcao['nome']}")
                produto_existente.descricao = opcao["descricao"]
                produto_existente.preco = opcao["preco"]
                produto_existente.categoria = opcao["categoria"]
                produto_existente.disponivel = True
                if opcao["imagem_url"]:
                    produto_existente.imagem_url = opcao["imagem_url"]
                produtos_atualizados += 1
            else:
                print(f"\n➕ Criando: {opcao['nome']}")
                novo_produto = Esfiha(
                    nome=opcao["nome"],
                    descricao=opcao["descricao"],
                    preco=opcao["preco"],
                    categoria=opcao["categoria"],
                    disponivel=True,
                    imagem_url=opcao["imagem_url"]
                )
                db.session.add(novo_produto)
                produtos_criados += 1
            
            print(f"   Preço: R$ {opcao['preco']:.2f}")
            print(f"   Categoria: {opcao['categoria']}")
        
        # Desativar batata recheada genérica se existir
        if batata_existente and "CALABRESA" not in batata_existente.nome.upper() and "BACON" not in batata_existente.nome.upper():
            print(f"\n⚠️  Desativando produto genérico: {batata_existente.nome}")
            batata_existente.disponivel = False
            print(f"   (Os clientes agora escolherão entre as opções específicas)")
        
        db.session.commit()
        
        print("\n" + "=" * 60)
        print("RESUMO")
        print("=" * 60)
        print(f"✅ Produtos criados: {produtos_criados}")
        print(f"🔄 Produtos atualizados: {produtos_atualizados}")
        print("\n📋 Opções disponíveis:")
        print("   1. BATATA FRITA RECHEADA - CALABRESA E MUSSARELA")
        print("   2. BATATA FRITA RECHEADA - BACON E CHEDDAR")
        print(f"   Preço: R$ {preco_base:.2f} (ambas)")
        print("\n" + "=" * 60)
        print("CONCLUÍDO COM SUCESSO!")
        print("=" * 60)

if __name__ == '__main__':
    adicionar_opcoes_batata()
