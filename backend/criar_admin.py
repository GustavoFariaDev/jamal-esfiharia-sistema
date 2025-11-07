#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar usuário admin
"""

import os
import sys

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db, User


def criar_admin():
    """Cria usuário admin se não existir"""
    
    app = create_app()
    
    with app.app_context():
        # Verificar se admin já existe
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            print("✓ Usuário admin já existe")
            print(f"  Username: admin")
            print(f"  Email: {admin.email}")
            return
        
        # Criar novo admin
        try:
            novo_admin = User(
                username='admin',
                email='admin@jamal.com',
                is_admin=True
            )
            novo_admin.set_password('SOA$k4N_,f}xj*X?RZ3ZVO^LripwE*Ck')
            
            db.session.add(novo_admin)
            db.session.commit()
            
            print("✓ Usuário admin criado com sucesso!")
            print(f"  Username: admin")
            print(f"  Email: admin@jamal.com")
            print(f"  Senha: SOA$k4N_,f}}xj*X?RZ3ZVO^LripwE*Ck")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Erro ao criar admin: {str(e)}")


if __name__ == '__main__':
    criar_admin()
