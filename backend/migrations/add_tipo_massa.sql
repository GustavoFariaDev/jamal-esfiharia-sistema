-- Migração: Adicionar campo tipo_massa à tabela item_pedido
-- Data: 20/11/2025
-- Descrição: Permite que o cliente escolha se a esfiha é aberta ou fechada

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'item_pedido' 
        AND column_name = 'tipo_massa'
    ) THEN
        ALTER TABLE item_pedido ADD COLUMN tipo_massa VARCHAR(20);
        RAISE NOTICE 'Coluna tipo_massa adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna tipo_massa já existe';
    END IF;
END $$;
