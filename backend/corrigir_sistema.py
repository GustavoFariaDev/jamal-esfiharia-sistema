#!/usr/bin/env python3
"""
Script para Diagnosticar e Corrigir Problemas do Sistema
- Produtos com preço R$ 0,00
- Imagens não aparecendo
- Acréscimos não disponíveis
"""

import os
from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha
from src.models.acrescimo import Acrescimo

def diagnosticar():
    """Diagnostica problemas no sistema"""
    print("=" * 70)
    print("🔍 DIAGNÓSTICO DO SISTEMA")
    print("=" * 70)
    
    # Problema 1: Produtos com preço zerado
    produtos_sem_preco = Esfiha.query.filter(
        (Esfiha.preco == 0) | (Esfiha.preco == None)
    ).all()
    
    print(f"\n❌ PROBLEMA 1: Produtos com R$ 0,00")
    print(f"   Total: {len(produtos_sem_preco)} produtos")
    
    if produtos_sem_preco:
        print(f"\n   Primeiros 10 produtos com preço zerado:")
        for produto in produtos_sem_preco[:10]:
            print(f"   • ID {produto.id}: {produto.nome}")
            print(f"     Broto: R$ {produto.preco_broto or 0:.2f} | "
                  f"Média: R$ {produto.preco_media or 0:.2f} | "
                  f"Grande: R$ {produto.preco_grande or 0:.2f}")
    
    # Problema 2: Imagens
    produtos_sem_imagem = Esfiha.query.filter(
        (Esfiha.imagem_url == None) | (Esfiha.imagem_url == '')
    ).count()
    
    print(f"\n❌ PROBLEMA 2: Produtos sem imagem")
    print(f"   Total: {produtos_sem_imagem} produtos")
    
    # Verificar pasta de uploads
    static_uploads = os.path.join(os.getcwd(), 'static', 'uploads')
    if os.path.exists(static_uploads):
        imagens_fisicas = len([f for f in os.listdir(static_uploads) 
                              if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))])
        print(f"   ✅ Pasta de uploads existe: {static_uploads}")
        print(f"   ✅ Imagens físicas: {imagens_fisicas}")
    else:
        print(f"   ❌ Pasta de uploads NÃO existe: {static_uploads}")
    
    # Problema 3: Acréscimos
    total_acrescimos = Acrescimo.query.count()
    acrescimos_disponiveis = Acrescimo.query.filter_by(disponivel=True).count()
    
    print(f"\n❌ PROBLEMA 3: Acréscimos")
    print(f"   Total no banco: {total_acrescimos}")
    print(f"   Disponíveis: {acrescimos_disponiveis}")
    
    if total_acrescimos > 0:
        print(f"\n   Acréscimos por tipo:")
        for tipo in ['esfiha', 'pizza_metade', 'pizza_toda', 'borda']:
            count = Acrescimo.query.filter_by(tipo=tipo, disponivel=True).count()
            print(f"   • {tipo}: {count} itens")
    
    print("\n" + "=" * 70)

def corrigir_precos():
    """Corrige produtos com preço zerado"""
    print("\n" + "=" * 70)
    print("🔧 CORRIGINDO PREÇOS")
    print("=" * 70)
    
    produtos_sem_preco = Esfiha.query.filter(
        (Esfiha.preco == 0) | (Esfiha.preco == None)
    ).all()
    
    if not produtos_sem_preco:
        print("✅ Nenhum produto com preço zerado encontrado!")
        return
    
    print(f"\n📦 Corrigindo {len(produtos_sem_preco)} produtos...")
    
    corrigidos = 0
    nao_corrigidos = 0
    
    for produto in produtos_sem_preco:
        # Tentar usar preço disponível
        preco_novo = (
            produto.preco_broto or 
            produto.preco_media or 
            produto.preco_grande or 
            0
        )
        
        if preco_novo > 0:
            produto.preco = preco_novo
            corrigidos += 1
            print(f"   ✅ {produto.nome}: R$ {preco_novo:.2f}")
        else:
            nao_corrigidos += 1
            print(f"   ⚠️  {produto.nome}: Sem preço disponível")
    
    db.session.commit()
    
    print(f"\n✅ Correção concluída!")
    print(f"   Corrigidos: {corrigidos}")
    print(f"   Não corrigidos: {nao_corrigidos}")

def verificar_imagens():
    """Verifica status das imagens"""
    print("\n" + "=" * 70)
    print("🖼️  VERIFICANDO IMAGENS")
    print("=" * 70)
    
    static_uploads = os.path.join(os.getcwd(), 'static', 'uploads')
    
    if not os.path.exists(static_uploads):
        print(f"\n❌ Pasta não existe: {static_uploads}")
        print(f"   Criando pasta...")
        os.makedirs(static_uploads, exist_ok=True)
        print(f"   ✅ Pasta criada!")
    else:
        imagens = [f for f in os.listdir(static_uploads) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))]
        print(f"\n✅ Pasta existe: {static_uploads}")
        print(f"✅ Total de imagens: {len(imagens)}")
        
        if len(imagens) == 0:
            print(f"\n⚠️  ATENÇÃO: Nenhuma imagem encontrada!")
            print(f"   As imagens precisam ser copiadas para esta pasta.")

def popular_acrescimos():
    """Popula acréscimos no banco de dados"""
    print("\n" + "=" * 70)
    print("🧀 POPULANDO ACRÉSCIMOS")
    print("=" * 70)
    
    # Verificar se já existem
    total_existente = Acrescimo.query.count()
    
    if total_existente > 0:
        resposta = input(f"\n⚠️  Já existem {total_existente} acréscimos. Deseja limpar e recriar? (s/N): ").strip().lower()
        if resposta == 's':
            Acrescimo.query.delete()
            db.session.commit()
            print("✅ Acréscimos removidos")
        else:
            print("ℹ️  Mantendo acréscimos existentes")
            return
    
    # Acréscimos para esfihas
    acrescimos_esfiha = [
        {'nome': 'Cebola', 'preco': 3.00},
        {'nome': 'Tomate', 'preco': 3.00},
        {'nome': 'Bacon', 'preco': 4.00},
        {'nome': 'Catupiry', 'preco': 4.00},
        {'nome': 'Cheddar', 'preco': 4.00},
        {'nome': 'Mussarela', 'preco': 4.00},
        {'nome': 'Provolone', 'preco': 5.00},
        {'nome': 'Gorgonzola', 'preco': 5.00},
        {'nome': 'Parmesão', 'preco': 5.00},
    ]
    
    print("\n📦 Adicionando acréscimos para esfihas...")
    for i, acr in enumerate(acrescimos_esfiha, 1):
        acrescimo = Acrescimo(
            nome=acr['nome'],
            tipo='esfiha',
            preco=acr['preco'],
            disponivel=True,
            ordem=i
        )
        db.session.add(acrescimo)
    
    # Acréscimos para pizza metade
    acrescimos_pizza = [
        'Mussarela', 'Catupiry', 'Cheddar', 'Provolone', 'Parmesão',
        'Gorgonzola', 'Cebola', 'Tomate', 'Bacon', 'Brócolis',
        'Alho', 'Frango', 'Calabresa', 'Ovo'
    ]
    
    print("📦 Adicionando acréscimos para metade da pizza...")
    for i, nome in enumerate(acrescimos_pizza, 1):
        acrescimo = Acrescimo(
            nome=nome,
            tipo='pizza_metade',
            preco=7.00,
            disponivel=True,
            ordem=i
        )
        db.session.add(acrescimo)
    
    print("📦 Adicionando acréscimos para pizza toda...")
    for i, nome in enumerate(acrescimos_pizza, 1):
        acrescimo = Acrescimo(
            nome=nome,
            tipo='pizza_toda',
            preco=12.00,
            disponivel=True,
            ordem=i
        )
        db.session.add(acrescimo)
    
    # Bordas
    bordas = [
        {'nome': 'Borda de Catupiry', 'preco': 13.00},
        {'nome': 'Borda de Cheddar', 'preco': 13.00},
        {'nome': 'Borda de Mussarela', 'preco': 13.00},
        {'nome': 'Borda de Chocolate', 'preco': 14.00},
        {'nome': 'Borda de Creme de Avelã', 'preco': 16.00},
    ]
    
    print("📦 Adicionando bordas...")
    for i, borda in enumerate(bordas, 1):
        acrescimo = Acrescimo(
            nome=borda['nome'],
            tipo='borda',
            preco=borda['preco'],
            disponivel=True,
            ordem=i
        )
        db.session.add(acrescimo)
    
    db.session.commit()
    
    total = Acrescimo.query.count()
    print(f"\n✅ {total} acréscimos adicionados com sucesso!")

def main():
    """Função principal"""
    print("=" * 70)
    print("🔧 CORREÇÃO DO SISTEMA JAMAL ESFIHARIA")
    print("=" * 70)
    
    app = create_app()
    
    with app.app_context():
        # Passo 1: Diagnosticar
        diagnosticar()
        
        # Passo 2: Corrigir preços
        print("\n")
        resposta = input("Deseja corrigir os preços zerados? (s/N): ").strip().lower()
        if resposta == 's':
            corrigir_precos()
        
        # Passo 3: Verificar imagens
        verificar_imagens()
        
        # Passo 4: Popular acréscimos
        print("\n")
        resposta = input("Deseja popular os acréscimos? (s/N): ").strip().lower()
        if resposta == 's':
            popular_acrescimos()
        
        # Diagnóstico final
        print("\n")
        diagnosticar()
    
    print("\n" + "=" * 70)
    print("✅ CORREÇÃO CONCLUÍDA!")
    print("=" * 70)
    print("\n💡 Próximos passos:")
    print("   1. Verifique o painel administrativo")
    print("   2. Teste adicionar produtos ao carrinho")
    print("   3. Confirme se os acréscimos aparecem")
    print("=" * 70)

if __name__ == '__main__':
    main()
