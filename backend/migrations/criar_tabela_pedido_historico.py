"""
Migration: Criar tabela pedido_historico
Data: 2025-11-10
Descrição: Cria tabela para armazenar histórico de mudanças de status dos pedidos
"""

import sys
import os

# Adicionar o diretório pai ao path para importar os módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.models.user import db
from flask import Flask

def run_migration():
    """Executa a migration"""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', '').replace('postgres://', 'postgresql://')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        # SQL para criar a tabela
        sql = """
        CREATE TABLE IF NOT EXISTS pedido_historico (
            id SERIAL PRIMARY KEY,
            pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
            status_anterior VARCHAR(50),
            status_novo VARCHAR(50) NOT NULL,
            data_mudanca TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            usuario_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
            observacao TEXT,
            CONSTRAINT fk_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id),
            CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES "user"(id)
        );
        
        -- Criar índices para melhor performance
        CREATE INDEX IF NOT EXISTS idx_pedido_historico_pedido_id ON pedido_historico(pedido_id);
        CREATE INDEX IF NOT EXISTS idx_pedido_historico_data_mudanca ON pedido_historico(data_mudanca);
        """
        
        try:
            db.session.execute(db.text(sql))
            db.session.commit()
            print('✅ Migration concluída com sucesso!')
            print('📊 Tabela pedido_historico criada')
            
            # Verificar se a tabela foi criada
            result = db.session.execute(db.text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'pedido_historico'
            """))
            
            if result.fetchone():
                print('✅ Tabela verificada com sucesso')
            else:
                print('⚠️ Aviso: Tabela não encontrada após criação')
                
        except Exception as e:
            db.session.rollback()
            print(f'❌ Erro ao executar migration: {str(e)}')
            raise

if __name__ == '__main__':
    run_migration()
