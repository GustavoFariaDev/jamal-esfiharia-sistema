#!/usr/bin/env python3
"""
Migração: Adicionar campos complemento e cep_entrega à tabela pedido
Data: 09/11/2025
"""

from sqlalchemy import text
from src.models.user import db
from app import create_app

def migrate():
    """Adiciona as colunas complemento e cep_entrega"""
    app = create_app()
    
    with app.app_context():
        try:
            # Verificar se as colunas já existem
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='pedido' 
                AND column_name IN ('complemento', 'cep_entrega')
            """))
            existing_columns = [row[0] for row in result]
            
            # Adicionar complemento se não existir
            if 'complemento' not in existing_columns:
                print("Adicionando coluna 'complemento'...")
                db.session.execute(text("""
                    ALTER TABLE pedido 
                    ADD COLUMN complemento VARCHAR(200)
                """))
                print("✅ Coluna 'complemento' adicionada")
            else:
                print("⚠️  Coluna 'complemento' já existe")
            
            # Adicionar cep_entrega se não existir
            if 'cep_entrega' not in existing_columns:
                print("Adicionando coluna 'cep_entrega'...")
                db.session.execute(text("""
                    ALTER TABLE pedido 
                    ADD COLUMN cep_entrega VARCHAR(10)
                """))
                print("✅ Coluna 'cep_entrega' adicionada")
            else:
                print("⚠️  Coluna 'cep_entrega' já existe")
            
            db.session.commit()
            print("\n🎉 Migração concluída com sucesso!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Erro na migração: {e}")
            raise

if __name__ == '__main__':
    migrate()
