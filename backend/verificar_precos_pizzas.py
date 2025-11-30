"""
Script para verificar se os preços das pizzas estão corretos no banco de dados
Verifica se preco_grande, preco_media e preco_broto estão preenchidos
"""

import sys
import os

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

# Criar a aplicação
app = create_app()

def verificar_precos_pizzas():
    """Verifica os preços das pizzas no banco de dados"""
    
    with app.app_context():
        print("\n" + "="*80)
        print("VERIFICAÇÃO DE PREÇOS DAS PIZZAS")
        print("="*80)
        
        # Buscar todas as pizzas
        pizzas = Esfiha.query.filter(
            Esfiha.categoria.like('%PIZZA%')
        ).order_by(Esfiha.nome).all()
        
        if not pizzas:
            print("\n❌ Nenhuma pizza encontrada no banco de dados!")
            return
        
        print(f"\n✓ Encontradas {len(pizzas)} pizzas no banco de dados\n")
        
        problemas = []
        ok = []
        
        for pizza in pizzas:
            print(f"\n{'='*80}")
            print(f"Pizza: {pizza.nome}")
            print(f"ID: {pizza.id}")
            print(f"Categoria: {pizza.categoria}")
            print(f"-" * 80)
            
            # Verificar preços
            tem_problema = False
            
            print(f"Preço base (preco):        R$ {pizza.preco:.2f}")
            
            if pizza.preco_grande:
                print(f"Preço grande:              R$ {pizza.preco_grande:.2f} ✓")
            else:
                print(f"Preço grande:              NÃO CADASTRADO ❌")
                tem_problema = True
            
            if pizza.preco_media:
                print(f"Preço média:               R$ {pizza.preco_media:.2f} ✓")
            else:
                print(f"Preço média:               NÃO CADASTRADO ❌")
                tem_problema = True
            
            if pizza.preco_broto:
                print(f"Preço broto:               R$ {pizza.preco_broto:.2f} ✓")
            else:
                print(f"Preço broto:               NÃO CADASTRADO ❌")
                tem_problema = True
            
            if tem_problema:
                problemas.append(pizza)
                print(f"\n⚠️  PROBLEMA: Preços por tamanho não estão completos!")
            else:
                ok.append(pizza)
                print(f"\n✅ OK: Todos os preços cadastrados")
        
        # Resumo final
        print("\n" + "="*80)
        print("RESUMO")
        print("="*80)
        print(f"\n✅ Pizzas OK: {len(ok)}")
        print(f"❌ Pizzas com problema: {len(problemas)}")
        
        if problemas:
            print(f"\n⚠️  ATENÇÃO: {len(problemas)} pizzas precisam ter os preços atualizados!")
            print("\nPizzas com problema:")
            for p in problemas:
                print(f"  - {p.nome} (ID: {p.id})")
            
            print("\n" + "="*80)
            print("SOLUÇÃO")
            print("="*80)
            print("\nVocê precisa:")
            print("1. Atualizar os preços no banco de dados manualmente OU")
            print("2. Executar o script 'atualizar_precos_pizzas.py' que vou criar")
            print("\nSem os preços corretos por tamanho, o cálculo meio a meio NÃO vai funcionar!")
        else:
            print("\n✅ Todos os preços estão corretos!")
            print("O cálculo de meio a meio deve funcionar perfeitamente.")
        
        print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    verificar_precos_pizzas()
