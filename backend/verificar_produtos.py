#!/usr/bin/env python3
"""
Script de Verificação Rápida
Sistema Jamal Esfiharia

Verifica o status dos produtos e imagens no sistema.
"""

import os
from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

def main():
    print("=" * 70)
    print("🔍 VERIFICAÇÃO DE PRODUTOS E IMAGENS")
    print("=" * 70)
    
    app = create_app()
    
    with app.app_context():
        # Estatísticas de produtos
        total_produtos = Esfiha.query.count()
        produtos_com_imagem = Esfiha.query.filter(
            Esfiha.imagem_url != None, 
            Esfiha.imagem_url != ''
        ).count()
        produtos_disponiveis = Esfiha.query.filter_by(disponivel=True).count()
        produtos_indisponiveis = Esfiha.query.filter_by(disponivel=False).count()
        
        print(f"\n📊 ESTATÍSTICAS DE PRODUTOS:")
        print(f"   Total de produtos: {total_produtos}")
        print(f"   Produtos disponíveis: {produtos_disponiveis}")
        print(f"   Produtos indisponíveis: {produtos_indisponiveis}")
        print(f"   Produtos com imagem: {produtos_com_imagem}")
        print(f"   Produtos sem imagem: {total_produtos - produtos_com_imagem}")
        
        # Categorias
        categorias = db.session.query(Esfiha.categoria).distinct().all()
        
        print(f"\n📋 CATEGORIAS ({len(categorias)}):")
        for cat in sorted(categorias):
            if cat[0]:
                count = Esfiha.query.filter_by(categoria=cat[0]).count()
                disponiveis = Esfiha.query.filter_by(
                    categoria=cat[0], 
                    disponivel=True
                ).count()
                print(f"   • {cat[0]}: {count} produtos ({disponiveis} disponíveis)")
        
        # Verificar imagens físicas
        static_uploads = os.path.join(os.getcwd(), 'static', 'uploads')
        
        if os.path.exists(static_uploads):
            imagens_fisicas = [
                f for f in os.listdir(static_uploads) 
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))
            ]
            print(f"\n🖼️  IMAGENS FÍSICAS:")
            print(f"   Pasta: {static_uploads}")
            print(f"   Total de imagens: {len(imagens_fisicas)}")
        else:
            print(f"\n⚠️  ATENÇÃO: Pasta de uploads não encontrada!")
            print(f"   Esperado: {static_uploads}")
        
        # Produtos mais caros
        print(f"\n💰 TOP 5 PRODUTOS MAIS CAROS:")
        produtos_caros = Esfiha.query.order_by(
            Esfiha.preco_grande.desc()
        ).limit(5).all()
        
        for i, produto in enumerate(produtos_caros, 1):
            preco = produto.preco_grande or produto.preco_media or produto.preco
            print(f"   {i}. {produto.nome}: R$ {preco:.2f}")
        
        # Produtos sem imagem
        produtos_sem_imagem = Esfiha.query.filter(
            (Esfiha.imagem_url == None) | (Esfiha.imagem_url == '')
        ).limit(5).all()
        
        if produtos_sem_imagem:
            print(f"\n⚠️  PRODUTOS SEM IMAGEM (primeiros 5):")
            for produto in produtos_sem_imagem:
                print(f"   • ID {produto.id}: {produto.nome}")
        
        # Status geral
        print(f"\n" + "=" * 70)
        if total_produtos > 0:
            print("✅ SISTEMA OK - Produtos cadastrados no banco de dados")
        else:
            print("⚠️  ATENÇÃO - Nenhum produto encontrado no banco de dados")
            print("   Execute o script de importação para adicionar produtos.")
        print("=" * 70)

if __name__ == '__main__':
    main()
