-- Migration para criar a tabela de notificações de pedidos
-- Data: 2025-11-10
-- Descrição: Cria a tabela de notificações para clientes receberem atualizações sobre seus pedidos

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
