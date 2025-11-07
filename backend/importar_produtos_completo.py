#!/usr/bin/env python3
"""
Script de Importação Completa de Produtos e Imagens
Sistema Jamal Esfiharia

Este script importa produtos de um arquivo JSON e copia as imagens correspondentes
para o diretório de uploads do sistema.

Uso:
    python3 importar_produtos_completo.py <caminho_para_produtos.json> <caminho_para_pasta_imagens>

Exemplo:
    python3 importar_produtos_completo.py /home/ubuntu/upload/jamal_export/produtos.json /home/ubuntu/upload/jamal_export/imagens
"""

import os
import sys
import json
import shutil
from datetime import datetime
from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

def limpar_banco():
    """Remove todos os produtos existentes do banco de dados"""
    print("🗑️  Limpando banco de dados...")
    try:
        count = Esfiha.query.delete()
        db.session.commit()
        print(f"✅ {count} produtos removidos do banco de dados")
        return True
    except Exception as e:
        print(f"❌ Erro ao limpar banco: {e}")
        db.session.rollback()
        return False

def importar_produtos(json_path):
    """Importa produtos do arquivo JSON para o banco de dados"""
    print(f"\n📦 Importando produtos de: {json_path}")
    
    if not os.path.exists(json_path):
        print(f"❌ Arquivo não encontrado: {json_path}")
        return 0
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            produtos = json.load(f)
        
        print(f"📊 Total de produtos no arquivo: {len(produtos)}")
        
        importados = 0
        erros = 0
        
        for produto in produtos:
            try:
                # Criar novo produto
                novo_produto = Esfiha(
                    nome=produto['nome'],
                    descricao=produto.get('descricao', ''),
                    preco=produto.get('preco_broto', produto.get('preco_media', produto.get('preco_grande', 0))),
                    preco_broto=produto.get('preco_broto'),
                    preco_media=produto.get('preco_media'),
                    preco_grande=produto.get('preco_grande'),
                    categoria=produto.get('categoria', ''),
                    disponivel=produto.get('disponivel', True),
                    imagem_url=produto.get('imagem_url', '')
                )
                
                db.session.add(novo_produto)
                importados += 1
                
                if importados % 50 == 0:
                    print(f"   Processando... {importados}/{len(produtos)}")
                
            except Exception as e:
                erros += 1
                print(f"⚠️  Erro ao importar produto '{produto.get('nome', 'DESCONHECIDO')}': {e}")
        
        # Commit final
        db.session.commit()
        print(f"\n✅ Produtos importados com sucesso!")
        print(f"   ✓ Importados: {importados}")
        print(f"   ✗ Erros: {erros}")
        
        return importados
        
    except Exception as e:
        print(f"❌ Erro ao processar arquivo JSON: {e}")
        db.session.rollback()
        return 0

def copiar_imagens(pasta_origem, pasta_destino):
    """Copia todas as imagens da pasta de origem para a pasta de destino"""
    print(f"\n🖼️  Copiando imagens...")
    print(f"   Origem: {pasta_origem}")
    print(f"   Destino: {pasta_destino}")
    
    if not os.path.exists(pasta_origem):
        print(f"❌ Pasta de origem não encontrada: {pasta_origem}")
        return 0
    
    # Criar pasta de destino se não existir
    os.makedirs(pasta_destino, exist_ok=True)
    
    # Listar todas as imagens
    imagens = [f for f in os.listdir(pasta_origem) 
               if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))]
    
    print(f"📊 Total de imagens encontradas: {len(imagens)}")
    
    copiadas = 0
    erros = 0
    
    for imagem in imagens:
        try:
            origem = os.path.join(pasta_origem, imagem)
            destino = os.path.join(pasta_destino, imagem)
            
            # Copiar arquivo
            shutil.copy2(origem, destino)
            copiadas += 1
            
            if copiadas % 50 == 0:
                print(f"   Processando... {copiadas}/{len(imagens)}")
                
        except Exception as e:
            erros += 1
            print(f"⚠️  Erro ao copiar '{imagem}': {e}")
    
    print(f"\n✅ Imagens copiadas com sucesso!")
    print(f"   ✓ Copiadas: {copiadas}")
    print(f"   ✗ Erros: {erros}")
    
    return copiadas

def criar_pasta_static_uploads():
    """Cria a estrutura de pastas static/uploads se não existir"""
    static_uploads = os.path.join(os.getcwd(), 'static', 'uploads')
    os.makedirs(static_uploads, exist_ok=True)
    return static_uploads

def verificar_integridade():
    """Verifica a integridade dos dados importados"""
    print("\n🔍 Verificando integridade dos dados...")
    
    total_produtos = Esfiha.query.count()
    produtos_com_imagem = Esfiha.query.filter(Esfiha.imagem_url != None, Esfiha.imagem_url != '').count()
    produtos_disponiveis = Esfiha.query.filter_by(disponivel=True).count()
    
    categorias = db.session.query(Esfiha.categoria).distinct().all()
    
    print(f"\n📊 Estatísticas:")
    print(f"   Total de produtos: {total_produtos}")
    print(f"   Produtos com imagem: {produtos_com_imagem}")
    print(f"   Produtos disponíveis: {produtos_disponiveis}")
    print(f"   Categorias: {len(categorias)}")
    
    print(f"\n📋 Categorias encontradas:")
    for cat in categorias:
        if cat[0]:
            count = Esfiha.query.filter_by(categoria=cat[0]).count()
            print(f"   • {cat[0]}: {count} produtos")

def main():
    """Função principal"""
    print("=" * 70)
    print("🥟 JAMAL ESFIHARIA - IMPORTAÇÃO DE PRODUTOS E IMAGENS")
    print("=" * 70)
    print(f"⏰ Iniciado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 70)
    
    # Verificar argumentos
    if len(sys.argv) < 3:
        print("\n❌ Uso incorreto!")
        print("\nUso:")
        print("  python3 importar_produtos_completo.py <arquivo_json> <pasta_imagens>")
        print("\nExemplo:")
        print("  python3 importar_produtos_completo.py /home/ubuntu/upload/jamal_export/produtos.json /home/ubuntu/upload/jamal_export/imagens")
        sys.exit(1)
    
    json_path = sys.argv[1]
    pasta_imagens = sys.argv[2]
    
    # Criar aplicação Flask
    app = create_app()
    
    with app.app_context():
        # Passo 1: Limpar banco de dados
        print("\n" + "=" * 70)
        print("PASSO 1: LIMPEZA DO BANCO DE DADOS")
        print("=" * 70)
        
        resposta = input("\n⚠️  Deseja limpar todos os produtos existentes? (s/N): ").strip().lower()
        if resposta == 's':
            if not limpar_banco():
                print("❌ Falha ao limpar banco. Abortando...")
                sys.exit(1)
        else:
            print("ℹ️  Produtos existentes serão mantidos. Novos produtos serão adicionados.")
        
        # Passo 2: Importar produtos
        print("\n" + "=" * 70)
        print("PASSO 2: IMPORTAÇÃO DE PRODUTOS")
        print("=" * 70)
        
        produtos_importados = importar_produtos(json_path)
        
        if produtos_importados == 0:
            print("❌ Nenhum produto foi importado. Abortando...")
            sys.exit(1)
        
        # Passo 3: Copiar imagens
        print("\n" + "=" * 70)
        print("PASSO 3: CÓPIA DE IMAGENS")
        print("=" * 70)
        
        # Criar pasta static/uploads
        pasta_destino = criar_pasta_static_uploads()
        
        imagens_copiadas = copiar_imagens(pasta_imagens, pasta_destino)
        
        # Passo 4: Verificar integridade
        print("\n" + "=" * 70)
        print("PASSO 4: VERIFICAÇÃO DE INTEGRIDADE")
        print("=" * 70)
        
        verificar_integridade()
    
    # Resumo final
    print("\n" + "=" * 70)
    print("✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 70)
    print(f"📦 Produtos importados: {produtos_importados}")
    print(f"🖼️  Imagens copiadas: {imagens_copiadas}")
    print(f"⏰ Finalizado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 70)
    print("\n💡 Próximos passos:")
    print("   1. Reinicie o servidor backend")
    print("   2. Acesse o painel administrativo")
    print("   3. Verifique se os produtos estão aparecendo corretamente")
    print("=" * 70)

if __name__ == '__main__':
    main()
