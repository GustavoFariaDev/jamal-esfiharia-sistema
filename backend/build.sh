#!/usr/bin/env bash
# Build script para Render.com

set -o errexit

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios necessários
mkdir -p instance
mkdir -p uploads
mkdir -p static/uploads

# Inicializar banco de dados se não existir
if [ ! -f instance/jamal.db ]; then
    echo "Inicializando banco de dados..."
    python3 -c "from app import create_app; app = create_app(); print('✅ Banco de dados criado')"
fi

echo "✅ Build concluído com sucesso!"
