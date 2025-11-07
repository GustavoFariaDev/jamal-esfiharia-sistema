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
    
    # Criar admin apenas se não existir (preserva senha personalizada)
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        # Criar novo admin com senha padrão
        novo_admin = User(
            username='admin',
            email='admin@jamal.com',
            is_admin=True
        )
        novo_admin.set_password('admin123')
        db.session.add(novo_admin)
        db.session.commit()
        print('✅ Usuário admin criado: admin / admin123')
        print('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
    else:
        print('✅ Usuário admin já existe - senha preservada')
        print('   Username: admin')
        print('   Email: {}'.format(admin.email))
    
    # Inicializar status do restaurante
    from src.models.configuracao import StatusRestaurante
    status = StatusRestaurante.query.first()
    if not status:
        print('📝 Criando registro padrão de status do restaurante...')
        novo_status = StatusRestaurante(
            aberto=True,
            mensagem_fechamento='Estamos fechados no momento. Volte em breve!',
            horario_abertura='18:00',
            horario_fechamento='23:00',
            dias_funcionamento='["ter", "qua", "qui", "sex", "sab", "dom"]',
            aceita_pedidos=True,
            modo_manutencao=False,
            pausa_temporaria=False
        )
        db.session.add(novo_status)
        db.session.commit()
        print('✅ Status do restaurante criado!')
    else:
        print('✅ Status do restaurante já existe')
EOF

echo "✅ Build concluído com sucesso!"
