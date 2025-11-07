#!/usr/bin/env bash
# Build script para Render.com

set -o errexit

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios necessários
mkdir -p instance
mkdir -p uploads
mkdir -p static/uploads

# Inicializar banco de dados
echo "Inicializando banco de dados..."
python3 -c "from app import create_app; from src.models.user import db; app = create_app(); 
with app.app_context(): 
    db.create_all(); 
    print('✅ Banco de dados criado')"

# Criar usuário admin
echo "Criando usuário admin..."
python3 criar_admin.py

echo "✅ Build concluído com sucesso!"
