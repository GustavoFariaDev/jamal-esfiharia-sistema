#!/usr/bin/env bash
# Build script para Render.com

set -o errexit

echo "📦 Instalando dependências do backend..."
pip install -r requirements.txt

echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install || yarn install

echo "🏗️ Compilando frontend React..."
npm run build || yarn build

echo "📂 Copiando build do frontend para o backend..."
cd ../backend
rm -rf static
cp -r ../frontend/build static

echo "📁 Criando diretórios necessários..."
mkdir -p instance
mkdir -p uploads
mkdir -p static/uploads

# Inicializar banco de dados e criar admin
echo "Inicializando banco de dados e criando admin..."
python3 << EOF
from app import create_app
from src.models.user import db, User

app = create_app()
with app.app_context():
    db.create_all()
    print('✅ Tabelas criadas')
    
    # Criar ou atualizar admin
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        # Criar novo admin
        novo_admin = User(
            username='admin',
            email='admin@jamal.com',
            is_admin=True
        )
        novo_admin.set_password('admin123')
        db.session.add(novo_admin)
        db.session.commit()
        print('✅ Usuário admin criado: admin / admin123')
    else:
        # Atualizar senha do admin existente
        print('✅ Usuário admin já existe - atualizando senha...')
        admin.set_password('admin123')
        admin.email = 'admin@jamal.com'
        admin.is_admin = True
        db.session.commit()
        print('✅ Senha do admin atualizada: admin / admin123')
EOF

echo "✅ Build concluído com sucesso!"
