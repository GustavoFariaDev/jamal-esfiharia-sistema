"""
Script de teste para verificar o cálculo de preço de pizzas meio a meio
"""

import sys
import os

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from src.models.esfiha import Esfiha
from src.models.pedido import Pedido, ItemPedido

def test_meio_a_meio_calculation():
    """Testa o cálculo de preço para pizzas meio a meio"""
    
    with app.app_context():
        print("\n" + "="*60)
        print("TESTE DE CÁLCULO DE PREÇO - PIZZA MEIO A MEIO")
        print("="*60)
        
        # Buscar pizzas de exemplo
        pizzas = Esfiha.query.filter(
            Esfiha.categoria.like('%PIZZA%'),
            Esfiha.disponivel == True
        ).limit(10).all()
        
        if len(pizzas) < 2:
            print("❌ Erro: Não há pizzas suficientes no banco de dados")
            return
        
        print(f"\n✓ Encontradas {len(pizzas)} pizzas disponíveis\n")
        
        # Exibir pizzas e seus preços
        print("PIZZAS DISPONÍVEIS:")
        print("-" * 60)
        for i, pizza in enumerate(pizzas, 1):
            print(f"{i}. {pizza.nome}")
            print(f"   Preço base: R$ {pizza.preco:.2f}")
            if pizza.preco_broto:
                print(f"   Broto: R$ {pizza.preco_broto:.2f}")
            if pizza.preco_media:
                print(f"   Média: R$ {pizza.preco_media:.2f}")
            if pizza.preco_grande:
                print(f"   Grande: R$ {pizza.preco_grande:.2f}")
            print()
        
        # Testar cálculo com duas pizzas diferentes
        pizza1 = pizzas[0]
        pizza2 = pizzas[1]
        
        print("\n" + "="*60)
        print("TESTE DE CÁLCULO")
        print("="*60)
        print(f"\nPizza 1: {pizza1.nome} - R$ {pizza1.preco:.2f}")
        print(f"Pizza 2: {pizza2.nome} - R$ {pizza2.preco:.2f}")
        
        # Calcular preço esperado (deve ser o maior)
        preco_esperado = max(pizza1.preco, pizza2.preco)
        print(f"\n✓ Preço esperado (maior valor): R$ {preco_esperado:.2f}")
        
        # Testar com diferentes tamanhos
        tamanhos = ['broto', 'media', 'grande']
        
        for tamanho in tamanhos:
            preco1 = getattr(pizza1, f'preco_{tamanho}', None) or pizza1.preco
            preco2 = getattr(pizza2, f'preco_{tamanho}', None) or pizza2.preco
            preco_max = max(preco1, preco2)
            
            print(f"\nTamanho: {tamanho.upper()}")
            print(f"  Pizza 1: R$ {preco1:.2f}")
            print(f"  Pizza 2: R$ {preco2:.2f}")
            print(f"  ✓ Preço calculado (max): R$ {preco_max:.2f}")
        
        # Verificar pedidos recentes com meio a meio
        print("\n" + "="*60)
        print("VERIFICANDO PEDIDOS RECENTES COM MEIO A MEIO")
        print("="*60)
        
        pedidos_meio_a_meio = Pedido.query.join(ItemPedido).filter(
            ItemPedido.eh_meio_a_meio == True
        ).order_by(Pedido.data_criacao.desc()).limit(5).all()
        
        if not pedidos_meio_a_meio:
            print("\n⚠️  Nenhum pedido com meio a meio encontrado")
        else:
            print(f"\n✓ Encontrados {len(pedidos_meio_a_meio)} pedidos com meio a meio\n")
            
            for pedido in pedidos_meio_a_meio:
                print(f"\nPedido #{pedido.id} - {pedido.data_criacao}")
                print(f"Cliente: {pedido.nome_cliente}")
                
                for item in pedido.itens:
                    if item.eh_meio_a_meio:
                        pizza1_nome = item.esfiha.nome if item.esfiha else "Removida"
                        pizza2_nome = item.esfiha_metade2.nome if item.esfiha_metade2 else "Removida"
                        
                        print(f"\n  Pizza Meio a Meio:")
                        print(f"    Metade 1: {pizza1_nome}")
                        if item.esfiha:
                            print(f"      Preço: R$ {item.esfiha.preco:.2f}")
                        print(f"    Metade 2: {pizza2_nome}")
                        if item.esfiha_metade2:
                            print(f"      Preço: R$ {item.esfiha_metade2.preco:.2f}")
                        print(f"    Preço unitário salvo: R$ {item.preco_unitario:.2f}")
                        
                        # Verificar se o preço está correto
                        if item.esfiha and item.esfiha_metade2:
                            preco_esperado = max(item.esfiha.preco, item.esfiha_metade2.preco)
                            if abs(item.preco_unitario - preco_esperado) < 0.01:
                                print(f"    ✓ Preço CORRETO (maior valor)")
                            else:
                                print(f"    ❌ ERRO! Deveria ser R$ {preco_esperado:.2f}")
                                print(f"       Diferença: R$ {abs(item.preco_unitario - preco_esperado):.2f}")
        
        print("\n" + "="*60)
        print("TESTE CONCLUÍDO")
        print("="*60 + "\n")

if __name__ == "__main__":
    test_meio_a_meio_calculation()
