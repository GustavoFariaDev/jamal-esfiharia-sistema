# Migrações do Banco de Dados

Este diretório contém os scripts SQL de migração do banco de dados.

## Como executar as migrações

### Opção 1: Via psql (linha de comando)

```bash
psql -U seu_usuario -d nome_do_banco -f migrations/increase_imagem_url_length.sql
```

### Opção 2: Via interface gráfica (pgAdmin, DBeaver, etc.)

1. Conecte-se ao banco de dados
2. Abra o arquivo SQL
3. Execute o script

### Opção 3: Se estiver usando Render.com

1. Acesse o Dashboard do Render
2. Vá em seu banco de dados PostgreSQL
3. Clique em "Shell" ou "Connect"
4. Cole e execute o comando:

```sql
ALTER TABLE esfiha ALTER COLUMN imagem_url TYPE VARCHAR(500);
```

## Migrações disponíveis

### increase_imagem_url_length.sql
- **Data:** 2025-11-09
- **Descrição:** Aumenta o tamanho do campo `imagem_url` de 255 para 500 caracteres
- **Motivo:** Suportar URLs do Cloudinary que são mais longas

## Verificação

Após executar a migração, você pode verificar se funcionou com:

```sql
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'esfiha' AND column_name = 'imagem_url';
```

O resultado deve mostrar `character_maximum_length = 500`.
