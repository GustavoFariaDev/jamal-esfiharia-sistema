#!/usr/bin/env python3
"""
Script para resetar a senha do usuário admin
Pode ser executado manualmente ou via Render Shell
"""

from app import create_app
from src.models.user import db, User

def resetar_senha_admin():
    """Reseta a senha do admin para a senha padrão"""
    app = create_app()
    
    with app.app_context():
        # Buscar usuário admin
        admin = User.query.filter_by(username='admin').first()
        
        if not admin:
            print('❌ Usuário admin não encontrado!')
            print('Criando novo usuário admin...')
            
            novo_admin = User(
                username='admin',
                email='admin@jamal.com',
                is_admin=True
            )
            novo_admin.set_password('admin123')
            db.session.add(novo_admin)
            db.session.commit()
            
            print('✅ Usuário admin criado com sucesso!')
            print('   Username: admin')
            print('   Senha: admin123')
            print('   Email: admin@jamal.com')
        else:
            print(f'✅ Usuário admin encontrado: {admin.username}')
            print(f'   Email atual: {admin.email}')
            print('   Atualizando senha...')
            
            # Resetar senha
            admin.set_password('admin123')
            admin.email = 'admin@jamal.com'
            admin.is_admin = True
            db.session.commit()
            
            print('✅ Senha resetada com sucesso!')
            print('   Username: admin')
            print('   Nova senha: admin123')
            print('   Email: admin@jamal.com')

if __name__ == '__main__':
    print('=' * 60)
    print('🔐 RESETAR SENHA DO ADMIN')
    print('=' * 60)
    resetar_senha_admin()
    print('=' * 60)
    print('✅ Processo concluído!')
    print('=' * 60)
