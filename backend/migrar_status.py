"""
Script de migração para adicionar campos de pausa temporária
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db

def migrar():
    """Adiciona novos campos à tabela status_restaurante"""
    
    app = create_app()
    
    with app.app_context():
        try:
            # Tentar adicionar as colunas (se não existirem)
            with db.engine.connect() as conn:
                # Verificar se as colunas já existem
                result = conn.execute(db.text("PRAGMA table_info(status_restaurante)"))
                columns = [row[1] for row in result]
                
                if 'pausa_temporaria' not in columns:
                    print("Adicionando coluna 'pausa_temporaria'...")
                    conn.execute(db.text("ALTER TABLE status_restaurante ADD COLUMN pausa_temporaria BOOLEAN DEFAULT 0 NOT NULL"))
                    conn.commit()
                
                if 'pausa_ate' not in columns:
                    print("Adicionando coluna 'pausa_ate'...")
                    conn.execute(db.text("ALTER TABLE status_restaurante ADD COLUMN pausa_ate DATETIME"))
                    conn.commit()
                
                if 'tempo_pausa_minutos' not in columns:
                    print("Adicionando coluna 'tempo_pausa_minutos'...")
                    conn.execute(db.text("ALTER TABLE status_restaurante ADD COLUMN tempo_pausa_minutos INTEGER"))
                    conn.commit()
                
                print("✅ Migração concluída com sucesso!")
                
        except Exception as e:
            print(f"❌ Erro na migração: {e}")
            print("Recriando tabelas...")
            db.create_all()
            print("✅ Tabelas recriadas!")

if __name__ == '__main__':
    migrar()
