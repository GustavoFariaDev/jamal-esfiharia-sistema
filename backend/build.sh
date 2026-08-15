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
    
    # O admin NAO e criado aqui.
    #
    # Ate aqui o deploy criava 'admin' com a senha 'admin123', escrita neste
    # arquivo, num repositorio publico. Qualquer pessoa que subisse uma copia
    # deste sistema — ou que alcancasse este antes da senha ser trocada —
    # entrava como administrador. Senha padrao em script de deploy e senha
    # publicada.
    #
    # A criacao mora em POST /api/setup/create-admin, que exige o SETUP_TOKEN
    # do servidor e sorteia a senha na hora. Ver o README.
    admin = User.query.filter_by(username='admin').first()
    if admin:
        print('Usuario admin ja existe: {}'.format(admin.username))
    else:
        print('Nenhum admin cadastrado. Para criar o primeiro:')
        print('  curl -X POST https://SEU-APP/api/setup/create-admin \\\\')
        print('       -H "X-Setup-Token: \$SETUP_TOKEN"')
    
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
