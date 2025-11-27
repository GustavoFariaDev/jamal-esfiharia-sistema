#!/usr/bin/env python3
"""
Script para corrigir os preços das pizzas que estão com valores trocados
Especificamente: pizza média saindo pelo preço da broto
"""
import os
import sys

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

def corrigir_precos_pizzas():
    """
    Corrige os preços das pizzas que estão com valores trocados
    """
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("CORREÇÃO DE PREÇOS DAS PIZZAS")
        print("=" * 60)
        
        # Buscar todas as pizzas (categoria contém "PIZZA")
        pizzas = Esfiha.query.filter(
            Esfiha.categoria.ilike('%PIZZA%')
        ).all()
        
        print(f"\n✅ Encontradas {len(pizzas)} pizzas no sistema\n")
        
        correcoes_realizadas = 0
        
        for pizza in pizzas:
            print(f"\n📊 Analisando: {pizza.nome}")
            print(f"   Categoria: {pizza.categoria}")
            print(f"   Preços atuais:")
            print(f"   - Broto:  R$ {pizza.preco_broto:.2f}" if pizza.preco_broto else "   - Broto:  Não definido")
            print(f"   - Média:  R$ {pizza.preco_media:.2f}" if pizza.preco_media else "   - Média:  Não definido")
            print(f"   - Grande: R$ {pizza.preco_grande:.2f}" if pizza.preco_grande else "   - Grande: Não definido")
            print(f"   - Preço base: R$ {pizza.preco:.2f}")
            
            # Verificar se os preços estão corretos (média deve ser maior que broto)
            precisa_correcao = False
            
            if pizza.preco_broto and pizza.preco_media:
                if pizza.preco_media <= pizza.preco_broto:
                    print(f"   ⚠️  PROBLEMA: Preço médio (R$ {pizza.preco_media:.2f}) menor ou igual ao broto (R$ {pizza.preco_broto:.2f})")
                    precisa_correcao = True
            
            if pizza.preco_media and pizza.preco_grande:
                if pizza.preco_grande <= pizza.preco_media:
                    print(f"   ⚠️  PROBLEMA: Preço grande (R$ {pizza.preco_grande:.2f}) menor ou igual ao médio (R$ {pizza.preco_media:.2f})")
                    precisa_correcao = True
            
            # Se houver problema, aplicar correção padrão
            if precisa_correcao:
                print(f"   🔧 Aplicando correção...")
                
                # Padrão de preços para pizzas
                # Broto: 30.00, Média: 38.00, Grande: 65.00
                if pizza.preco_broto and pizza.preco_broto == 30.00:
                    pizza.preco_media = 38.00
                    pizza.preco_grande = 65.00
                    print(f"   ✅ Corrigido para: Broto R$ 30.00, Média R$ 38.00, Grande R$ 65.00")
                    correcoes_realizadas += 1
                else:
                    # Se não seguir o padrão, manter proporção
                    if pizza.preco_broto:
                        pizza.preco_media = round(pizza.preco_broto * 1.27, 2)  # ~27% mais caro
                        pizza.preco_grande = round(pizza.preco_broto * 2.17, 2)  # ~117% mais caro
                        print(f"   ✅ Corrigido proporcionalmente: Broto R$ {pizza.preco_broto:.2f}, Média R$ {pizza.preco_media:.2f}, Grande R$ {pizza.preco_grande:.2f}")
                        correcoes_realizadas += 1
        
        if correcoes_realizadas > 0:
            db.session.commit()
            print(f"\n✅ {correcoes_realizadas} pizza(s) corrigida(s) com sucesso!")
        else:
            print(f"\n✅ Nenhuma correção necessária. Todos os preços estão corretos!")
        
        print("\n" + "=" * 60)
        print("CORREÇÃO CONCLUÍDA")
        print("=" * 60)

if __name__ == '__main__':
    corrigir_precos_pizzas()
