"""
Script para criar a tabela de notificações no banco de dados
"""

import os
import sys

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.notificacao import Notificacao

def criar_tabela_notificacoes():
    """Cria a tabela de notificações no banco de dados"""
    app = create_app()
    
    with app.app_context():
        # Criar apenas a tabela de notificações
        db.create_all()
        print("✅ Tabela de notificações criada com sucesso!")
        
        # Verificar se a tabela foi criada
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        if 'notificacao' in tables:
            print("✅ Tabela 'notificacao' confirmada no banco de dados")
            
            # Mostrar colunas da tabela
            columns = inspector.get_columns('notificacao')
            print("\nColunas da tabela 'notificacao':")
            for col in columns:
                print(f"  - {col['name']}: {col['type']}")
        else:
            print("❌ Erro: Tabela 'notificacao' não foi criada")

if __name__ == '__main__':
    criar_tabela_notificacoes()
