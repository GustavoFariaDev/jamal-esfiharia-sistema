#!/usr/bin/env python3
"""
Script de Importação Rápida usando SQL Direto
Sistema Jamal Esfiharia

Este script importa produtos executando comandos SQL diretamente no banco de dados,
sendo muito mais rápido que a importação via ORM.

Uso:
    python3 importar_produtos_sql.py <caminho_para_produtos.sql> <caminho_para_pasta_imagens>

Exemplo:
    python3 importar_produtos_sql.py /home/ubuntu/upload/jamal_export/produtos.sql /home/ubuntu/upload/jamal_export/imagens
"""

import os
import sys
import shutil
from datetime import datetime
from app import create_app
from src.models.user import db

def executar_sql_file(sql_path):
    """Executa comandos SQL de um arquivo"""
    print(f"\n📦 Executando SQL de: {sql_path}")
    
    if not os.path.exists(sql_path):
        print(f"❌ Arquivo não encontrado: {sql_path}")
        return False
    
    try:
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Dividir em comandos individuais
        comandos = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
        
        print(f"📊 Total de comandos SQL: {len(comandos)}")
        
        executados = 0
        for i, comando in enumerate(comandos):
            try:
                db.session.execute(db.text(comando))
                executados += 1
                
                if (i + 1) % 50 == 0:
                    print(f"   Processando... {i + 1}/{len(comandos)}")
                    
            except Exception as e:
                print(f"⚠️  Erro no comando {i + 1}: {e}")
        
        db.session.commit()
        print(f"\n✅ Comandos SQL executados com sucesso!")
        print(f"   ✓ Executados: {executados}")
        print(f"   ✗ Erros: {len(comandos) - executados}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao processar arquivo SQL: {e}")
        db.session.rollback()
        return False

def limpar_tabela():
    """Remove todos os produtos da tabela esfiha"""
    print("🗑️  Limpando tabela esfiha...")
    try:
        db.session.execute(db.text("DELETE FROM esfiha"))
        db.session.commit()
        print("✅ Tabela limpa com sucesso")
        return True
    except Exception as e:
        print(f"❌ Erro ao limpar tabela: {e}")
        db.session.rollback()
        return False

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
    
    for i, imagem in enumerate(imagens):
        try:
            origem = os.path.join(pasta_origem, imagem)
            destino = os.path.join(pasta_destino, imagem)
            
            # Copiar arquivo
            shutil.copy2(origem, destino)
            copiadas += 1
            
            if (i + 1) % 50 == 0:
                print(f"   Processando... {i + 1}/{len(imagens)}")
                
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
    
    from src.models.esfiha import Esfiha
    
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
    
    return total_produtos

def main():
    """Função principal"""
    print("=" * 70)
    print("🥟 JAMAL ESFIHARIA - IMPORTAÇÃO RÁPIDA (SQL DIRETO)")
    print("=" * 70)
    print(f"⏰ Iniciado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 70)
    
    # Verificar argumentos
    if len(sys.argv) < 3:
        print("\n❌ Uso incorreto!")
        print("\nUso:")
        print("  python3 importar_produtos_sql.py <arquivo_sql> <pasta_imagens>")
        print("\nExemplo:")
        print("  python3 importar_produtos_sql.py /home/ubuntu/upload/jamal_export/produtos.sql /home/ubuntu/upload/jamal_export/imagens")
        sys.exit(1)
    
    sql_path = sys.argv[1]
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
            if not limpar_tabela():
                print("❌ Falha ao limpar banco. Abortando...")
                sys.exit(1)
        else:
            print("ℹ️  Produtos existentes serão mantidos. Novos produtos serão adicionados.")
        
        # Passo 2: Executar SQL
        print("\n" + "=" * 70)
        print("PASSO 2: EXECUÇÃO DE COMANDOS SQL")
        print("=" * 70)
        
        if not executar_sql_file(sql_path):
            print("❌ Falha ao executar SQL. Abortando...")
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
        
        total_produtos = verificar_integridade()
    
    # Resumo final
    print("\n" + "=" * 70)
    print("✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 70)
    print(f"📦 Produtos no banco: {total_produtos}")
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
