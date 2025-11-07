#!/usr/bin/env bash
# Build script para Render.com

set -o errexit

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios necessários
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
    
    # Criar admin se não existir
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        novo_admin = User(
            username='admin',
            email='admin@jamal.com',
            is_admin=True
        )
        novo_admin.set_password('SOA$k4N_,f}xj*X?RZ3ZVO^LripwE*Ck')
        db.session.add(novo_admin)
        db.session.commit()
        print('✅ Usuário admin criado: admin / SOA$k4N_,f}xj*X?RZ3ZVO^LripwE*Ck')
    else:
        print('✅ Usuário admin já existe')
EOF

echo "✅ Build concluído com sucesso!"
