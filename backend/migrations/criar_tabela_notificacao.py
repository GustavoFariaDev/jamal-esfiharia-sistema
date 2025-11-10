#!/usr/bin/env python3
"""
Migration para criar a tabela de notificações de pedidos
Executar este script para criar a tabela no banco de dados
"""

import os
import sys

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db

def criar_tabela_notificacao():
    """Cria a tabela de notificações no banco de dados"""
    
    sql = """
    -- Criar tabela de notificações
    CREATE TABLE IF NOT EXISTS notificacao (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
        cliente_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
        telefone VARCHAR(20) NOT NULL,
        status_pedido VARCHAR(30) NOT NULL,
        mensagem TEXT NOT NULL,
        lida BOOLEAN NOT NULL DEFAULT FALSE,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_leitura TIMESTAMP
    );
    
    -- Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_notificacao_pedido_id ON notificacao(pedido_id);
    CREATE INDEX IF NOT EXISTS idx_notificacao_cliente_id ON notificacao(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_notificacao_telefone ON notificacao(telefone);
    CREATE INDEX IF NOT EXISTS idx_notificacao_lida ON notificacao(lida);
    CREATE INDEX IF NOT EXISTS idx_notificacao_data_criacao ON notificacao(data_criacao);
    
    -- Comentários nas colunas
    COMMENT ON TABLE notificacao IS 'Armazena notificações de mudanças de status de pedidos para clientes';
    COMMENT ON COLUMN notificacao.pedido_id IS 'ID do pedido relacionado';
    COMMENT ON COLUMN notificacao.cliente_id IS 'ID do cliente (pode ser nulo para clientes não logados)';
    COMMENT ON COLUMN notificacao.telefone IS 'Telefone do cliente para notificação';
    COMMENT ON COLUMN notificacao.status_pedido IS 'Status que gerou a notificação';
    COMMENT ON COLUMN notificacao.mensagem IS 'Mensagem da notificação';
    COMMENT ON COLUMN notificacao.lida IS 'Indica se a notificação foi lida';
    COMMENT ON COLUMN notificacao.data_criacao IS 'Data e hora de criação da notificação';
    COMMENT ON COLUMN notificacao.data_leitura IS 'Data e hora em que a notificação foi lida';
    """
    
    with app.app_context():
        try:
            # Executar o SQL
            db.session.execute(db.text(sql))
            db.session.commit()
            print("✅ Tabela 'notificacao' criada com sucesso!")
            print("✅ Índices criados com sucesso!")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Erro ao criar tabela: {str(e)}")
            return False

if __name__ == "__main__":
    print("=" * 60)
    print("MIGRATION: Criar Tabela de Notificações")
    print("=" * 60)
    print()
    
    sucesso = criar_tabela_notificacao()
    
    print()
    print("=" * 60)
    if sucesso:
        print("✅ Migration concluída com sucesso!")
    else:
        print("❌ Migration falhou!")
    print("=" * 60)
    
    sys.exit(0 if sucesso else 1)
