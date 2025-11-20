#!/usr/bin/env python3
"""
Migração: Adicionar campo tipo_massa à tabela item_pedido
Data: 19/11/2025
Descrição: Permite que o cliente escolha se a esfiha é aberta ou fechada
"""

from sqlalchemy import text
from src.models.user import db
from app import create_app

def migrate():
    """Adiciona a coluna tipo_massa"""
    app = create_app()
    
    with app.app_context():
        try:
            # Verificar se a coluna já existe
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='item_pedido' 
                AND column_name='tipo_massa'
            """))
            existing_columns = [row[0] for row in result]
            
            # Adicionar tipo_massa se não existir
            if 'tipo_massa' not in existing_columns:
                print("Adicionando coluna 'tipo_massa'...")
                db.session.execute(text("""
                    ALTER TABLE item_pedido 
                    ADD COLUMN tipo_massa VARCHAR(20)
                """))
                print("✅ Coluna 'tipo_massa' adicionada")
            else:
                print("⚠️  Coluna 'tipo_massa' já existe")
            
            db.session.commit()
            print("\n🎉 Migração concluída com sucesso!")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Erro na migração: {e}")
            raise

if __name__ == '__main__':
    migrate()
