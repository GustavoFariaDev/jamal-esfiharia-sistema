#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para alterar senha do usuário admin para uma senha forte
"""

import os
import sys
import secrets
import string

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db, User


def gerar_senha_forte(tamanho=24):
    """
    Gera uma senha forte e aleatória
    
    Args:
        tamanho: Tamanho da senha (padrão: 24 caracteres)
    
    Returns:
        String com senha forte contendo letras maiúsculas, minúsculas, números e símbolos
    """
    # Caracteres permitidos
    letras_maiusculas = string.ascii_uppercase
    letras_minusculas = string.ascii_lowercase
    digitos = string.digits
    simbolos = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Garantir pelo menos um de cada tipo
    senha = [
        secrets.choice(letras_maiusculas),
        secrets.choice(letras_minusculas),
        secrets.choice(digitos),
        secrets.choice(simbolos)
    ]
    
    # Preencher o resto aleatoriamente
    todos_caracteres = letras_maiusculas + letras_minusculas + digitos + simbolos
    senha += [secrets.choice(todos_caracteres) for _ in range(tamanho - 4)]
    
    # Embaralhar a senha
    secrets.SystemRandom().shuffle(senha)
    
    return ''.join(senha)


def alterar_senha_admin():
    """Altera a senha do usuário admin para uma senha forte"""
    
    app = create_app()
    
    with app.app_context():
        # Buscar usuário admin
        admin = User.query.filter_by(username='admin').first()
        
        if not admin:
            print("✗ Usuário admin não encontrado!")
            print("  Execute primeiro: python3 criar_admin.py")
            return None
        
        # Gerar nova senha forte
        nova_senha = gerar_senha_forte(32)
        
        # Atualizar senha
        try:
            admin.set_password(nova_senha)
            db.session.commit()
            
            print("=" * 70)
            print("✓ SENHA DO ADMIN ALTERADA COM SUCESSO!")
            print("=" * 70)
            print()
            print("📋 CREDENCIAIS DE ACESSO:")
            print(f"   Username: {admin.username}")
            print(f"   Email: {admin.email}")
            print(f"   Nova Senha: {nova_senha}")
            print()
            print("⚠️  IMPORTANTE:")
            print("   1. Guarde esta senha em local seguro (gerenciador de senhas)")
            print("   2. Esta senha NÃO será exibida novamente")
            print("   3. Use esta senha para fazer login no sistema")
            print()
            print("=" * 70)
            
            return nova_senha
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Erro ao alterar senha: {str(e)}")
            return None


if __name__ == '__main__':
    alterar_senha_admin()
