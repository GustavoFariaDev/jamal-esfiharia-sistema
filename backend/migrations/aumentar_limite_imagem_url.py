"""
Migration: Aumentar limite do campo imagem_url de 255 para 500 caracteres

Data: 10 de novembro de 2025
Motivo: Permitir URLs longas de serviços de imagem externos
"""

import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models.user import db
from src.models.esfiha import Esfiha
from app import app

def run_migration():
    """
    Aumenta o limite do campo imagem_url de VARCHAR(255) para VARCHAR(500)
    """
    with app.app_context():
        try:
            print("🔄 Iniciando migration: Aumentar limite do campo imagem_url...")
            
            # Executar ALTER TABLE para aumentar o limite
            db.session.execute(db.text("""
                ALTER TABLE esfiha 
                ALTER COLUMN imagem_url TYPE VARCHAR(500);
            """))
            
            db.session.commit()
            
            print("✅ Migration concluída com sucesso!")
            print("📊 Campo imagem_url agora aceita até 500 caracteres.")
            
        except Exception as e:
            print(f"❌ Erro ao executar migration: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    run_migration()
