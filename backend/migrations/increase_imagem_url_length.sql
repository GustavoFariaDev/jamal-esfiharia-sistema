-- Migração: Aumentar tamanho do campo imagem_url
-- Data: 2025-11-09
-- Motivo: Suportar URLs do Cloudinary que são mais longas que 255 caracteres

-- Aumentar o tamanho do campo imagem_url de VARCHAR(255) para VARCHAR(500)
ALTER TABLE esfiha 
ALTER COLUMN imagem_url TYPE VARCHAR(500);

-- Verificar a alteração
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'esfiha' AND column_name = 'imagem_url';
