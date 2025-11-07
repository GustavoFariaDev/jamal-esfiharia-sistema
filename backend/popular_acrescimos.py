"""
Script para popular os acréscimos no banco de dados
"""
import sys
import os

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.acrescimo import Acrescimo

def popular_acrescimos():
    """Popula os acréscimos no banco de dados"""
    
    app = create_app()
    
    with app.app_context():
        # Limpar acréscimos existentes (opcional)
        print("Limpando acréscimos existentes...")
        Acrescimo.query.delete()
        db.session.commit()
        
        # Acréscimos nas esfihas
        acrescimos_esfiha = [
            {'nome': 'Cebola', 'preco': 3.00, 'ordem': 1},
            {'nome': 'Tomate', 'preco': 3.00, 'ordem': 2},
            {'nome': 'Bacon', 'preco': 4.00, 'ordem': 3},
            {'nome': 'Catupiry', 'preco': 4.00, 'ordem': 4},
            {'nome': 'Cheddar', 'preco': 4.00, 'ordem': 5},
            {'nome': 'Mussarela', 'preco': 4.00, 'ordem': 6},
            {'nome': 'Provolone', 'preco': 5.00, 'ordem': 7},
            {'nome': 'Gorgonzola', 'preco': 5.00, 'ordem': 8},
            {'nome': 'Parmesão', 'preco': 5.00, 'ordem': 9},
        ]
        
        print("Adicionando acréscimos para esfihas...")
        for acr in acrescimos_esfiha:
            acrescimo = Acrescimo(
                nome=acr['nome'],
                tipo='esfiha',
                preco=acr['preco'],
                disponivel=True,
                ordem=acr['ordem']
            )
            db.session.add(acrescimo)
        
        # Acréscimos metade da pizza
        acrescimos_pizza_metade = [
            {'nome': 'Mussarela', 'preco': 7.00, 'ordem': 1},
            {'nome': 'Catupiry', 'preco': 7.00, 'ordem': 2},
            {'nome': 'Cheddar', 'preco': 7.00, 'ordem': 3},
            {'nome': 'Provolone', 'preco': 7.00, 'ordem': 4},
            {'nome': 'Parmesão', 'preco': 7.00, 'ordem': 5},
            {'nome': 'Gorgonzola', 'preco': 7.00, 'ordem': 6},
            {'nome': 'Cebola', 'preco': 7.00, 'ordem': 7},
            {'nome': 'Tomate', 'preco': 7.00, 'ordem': 8},
            {'nome': 'Bacon', 'preco': 7.00, 'ordem': 9},
            {'nome': 'Brócolis', 'preco': 7.00, 'ordem': 10},
            {'nome': 'Alho', 'preco': 7.00, 'ordem': 11},
            {'nome': 'Frango', 'preco': 7.00, 'ordem': 12},
            {'nome': 'Calabresa', 'preco': 7.00, 'ordem': 13},
            {'nome': 'Ovo', 'preco': 7.00, 'ordem': 14},
        ]
        
        print("Adicionando acréscimos para metade da pizza...")
        for acr in acrescimos_pizza_metade:
            acrescimo = Acrescimo(
                nome=acr['nome'],
                tipo='pizza_metade',
                preco=acr['preco'],
                disponivel=True,
                ordem=acr['ordem']
            )
            db.session.add(acrescimo)
        
        # Acréscimos pizza toda
        acrescimos_pizza_toda = [
            {'nome': 'Mussarela', 'preco': 12.00, 'ordem': 1},
            {'nome': 'Catupiry', 'preco': 12.00, 'ordem': 2},
            {'nome': 'Cheddar', 'preco': 12.00, 'ordem': 3},
            {'nome': 'Provolone', 'preco': 12.00, 'ordem': 4},
            {'nome': 'Parmesão', 'preco': 12.00, 'ordem': 5},
            {'nome': 'Gorgonzola', 'preco': 12.00, 'ordem': 6},
            {'nome': 'Cebola', 'preco': 12.00, 'ordem': 7},
            {'nome': 'Tomate', 'preco': 12.00, 'ordem': 8},
            {'nome': 'Bacon', 'preco': 12.00, 'ordem': 9},
            {'nome': 'Brócolis', 'preco': 12.00, 'ordem': 10},
            {'nome': 'Alho', 'preco': 12.00, 'ordem': 11},
            {'nome': 'Frango', 'preco': 12.00, 'ordem': 12},
            {'nome': 'Calabresa', 'preco': 12.00, 'ordem': 13},
            {'nome': 'Ovo', 'preco': 12.00, 'ordem': 14},
        ]
        
        print("Adicionando acréscimos para pizza toda...")
        for acr in acrescimos_pizza_toda:
            acrescimo = Acrescimo(
                nome=acr['nome'],
                tipo='pizza_toda',
                preco=acr['preco'],
                disponivel=True,
                ordem=acr['ordem']
            )
            db.session.add(acrescimo)
        
        # Bordas
        bordas = [
            {'nome': 'Borda de Catupiry', 'preco': 13.00, 'ordem': 1},
            {'nome': 'Borda de Cheddar', 'preco': 13.00, 'ordem': 2},
            {'nome': 'Borda de Mussarela', 'preco': 13.00, 'ordem': 3},
            {'nome': 'Borda de Chocolate', 'preco': 14.00, 'ordem': 4},
            {'nome': 'Borda de Creme de Avelã', 'preco': 16.00, 'ordem': 5},
        ]
        
        print("Adicionando bordas...")
        for borda in bordas:
            acrescimo = Acrescimo(
                nome=borda['nome'],
                tipo='borda',
                preco=borda['preco'],
                disponivel=True,
                ordem=borda['ordem']
            )
            db.session.add(acrescimo)
        
        # Salvar tudo
        db.session.commit()
        
        # Verificar
        total = Acrescimo.query.count()
        print(f"\n✅ Sucesso! {total} acréscimos adicionados ao banco de dados.")
        
        # Exibir resumo
        print("\nResumo por tipo:")
        for tipo in ['esfiha', 'pizza_metade', 'pizza_toda', 'borda']:
            count = Acrescimo.query.filter_by(tipo=tipo).count()
            print(f"  - {tipo}: {count} itens")

if __name__ == '__main__':
    popular_acrescimos()
