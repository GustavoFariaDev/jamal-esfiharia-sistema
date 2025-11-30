"""
Script para atualizar os preços das pizzas no banco de dados
Atualiza preco_grande, preco_media e preco_broto com os valores corretos do cardápio
"""

import sys
import os

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from src.models.esfiha import Esfiha

# Dicionário com os preços corretos de todas as pizzas
# Formato: 'NOME DA PIZZA': (preco_grande, preco_media, preco_broto)
PRECOS_PIZZAS = {
    'ALHO I': (50.00, 35.00, 30.00),
    'ALHO II': (56.00, 37.00, 32.00),
    'ALICHE I': (57.00, 38.00, 30.00),
    'ALICHE II': (62.00, 40.00, 33.00),
    'AMERICANA': (50.00, 31.00, 28.00),
    'ATUM': (57.00, 38.00, 30.00),
    'BACON I': (52.00, 37.00, 30.00),
    'BACON II': (57.00, 39.00, 31.00),
    'BAIACATU': (53.00, 37.00, 30.00),
    'BAIANA': (56.00, 39.00, 30.00),
    'BAURU': (50.00, 31.00, 26.00),
    'BRÓCOLIS': (51.00, 31.00, 26.00),
    'CAIPIRA': (56.00, 38.00, 30.00),
    'CALABRESA': (50.00, 30.00, 27.00),
    'CARNE SECA': (60.00, 40.00, 30.00),
    'CARIJÓ': (56.00, 38.00, 30.00),
    'CATUM': (60.00, 38.00, 30.00),
    'CATUPIRY': (50.00, 30.00, 25.00),
    'CITY': (57.00, 38.00, 30.00),
    'CZARIANA': (50.00, 34.00, 28.00),
    'BELA DONNA': (50.00, 34.00, 28.00),
    'FAFA II': (58.00, 40.00, 32.00),
    'ESCAROLA': (50.00, 33.00, 28.00),
    'FAFÁ': (55.00, 38.00, 30.00),
    'FRANCESA': (70.00, 40.00, 30.00),
    'FRANGAÇO': (60.00, 40.00, 32.00),
    'FRANGO COM CATUPIRY': (54.00, 36.00, 30.00),
    'IPIRANGA': (56.00, 38.00, 30.00),
    'LOMBO I': (52.00, 34.00, 28.00),
    'LOMBO II': (55.00, 37.00, 30.00),
    'MARGUERITA': (53.00, 30.00, 28.00),
    'MICHELLE': (55.00, 38.00, 30.00),
    'MILANO': (58.00, 38.00, 30.00),
    'MILHO I': (53.00, 33.00, 27.00),
    'MILHO II': (57.00, 36.00, 30.00),
    'MODA DA CASA': (58.00, 38.00, 30.00),
    'MUSSARELA': (50.00, 30.00, 27.00),
    'NAPOLITANA': (55.00, 34.00, 28.00),
    'NAMORADOS': (55.00, 33.00, 29.00),
    'PALMITO': (53.00, 33.00, 29.00),
    'PEPPERONI I': (54.00, 35.00, 29.00),
    'PEPPERONI II': (57.00, 38.00, 30.00),
    'PERUANA': (60.00, 38.00, 30.00),
    'PORTUGUESA': (57.00, 38.00, 30.00),
    '2 QUEIJOS': (53.00, 32.00, 27.00),
    '3 QUEIJOS': (58.00, 34.00, 29.00),
    '4 QUEIJOS': (65.00, 38.00, 30.00),
    '5 QUEIJOS': (70.00, 40.00, 35.00),
    'PROVOLONE CROCANTE': (60.00, 38.00, 30.00),
    'SICILIANA': (55.00, 38.00, 31.00),
    'TOSCANA I': (55.00, 32.00, 28.00),
    'TOSCANA II': (60.00, 38.00, 30.00),
    'VEGAS': (59.00, 36.00, 29.00),
    'BERINGELA I': (50.00, 32.00, 27.00),
    'BERINGELA II': (55.00, 34.00, 29.00),
}

def atualizar_precos():
    """Atualiza os preços de todas as pizzas no banco de dados"""
    
    with app.app_context():
        print("\n" + "="*80)
        print("ATUALIZAÇÃO DE PREÇOS DAS PIZZAS")
        print("="*80)
        
        # Buscar todas as pizzas
        pizzas = Esfiha.query.filter(
            Esfiha.categoria.like('%PIZZA%')
        ).all()
        
        if not pizzas:
            print("\n❌ Nenhuma pizza encontrada no banco de dados!")
            return
        
        print(f"\n✓ Encontradas {len(pizzas)} pizzas no banco de dados")
        print(f"✓ Preços cadastrados no script: {len(PRECOS_PIZZAS)} pizzas\n")
        
        atualizadas = 0
        nao_encontradas = []
        erros = []
        
        for pizza in pizzas:
            nome_pizza = pizza.nome.upper().strip()
            
            # Tentar encontrar o preço
            precos = PRECOS_PIZZAS.get(nome_pizza)
            
            if not precos:
                nao_encontradas.append(pizza.nome)
                print(f"⚠️  {pizza.nome} - Preços não encontrados no script")
                continue
            
            preco_grande, preco_media, preco_broto = precos
            
            try:
                # Atualizar os preços
                pizza.preco_grande = preco_grande
                pizza.preco_media = preco_media
                pizza.preco_broto = preco_broto
                
                # Atualizar também o preco base (usar o menor valor)
                pizza.preco = preco_broto
                
                print(f"✓ {pizza.nome}")
                print(f"  Grande: R$ {preco_grande:.2f}")
                print(f"  Média:  R$ {preco_media:.2f}")
                print(f"  Broto:  R$ {preco_broto:.2f}")
                
                atualizadas += 1
                
            except Exception as e:
                erros.append((pizza.nome, str(e)))
                print(f"❌ {pizza.nome} - Erro: {str(e)}")
        
        # Salvar as alterações
        if atualizadas > 0:
            try:
                db.session.commit()
                print("\n" + "="*80)
                print("✅ ALTERAÇÕES SALVAS NO BANCO DE DADOS!")
                print("="*80)
            except Exception as e:
                db.session.rollback()
                print("\n" + "="*80)
                print(f"❌ ERRO AO SALVAR: {str(e)}")
                print("="*80)
                return
        
        # Resumo final
        print("\n" + "="*80)
        print("RESUMO")
        print("="*80)
        print(f"\n✅ Pizzas atualizadas: {atualizadas}")
        print(f"⚠️  Pizzas não encontradas: {len(nao_encontradas)}")
        print(f"❌ Erros: {len(erros)}")
        
        if nao_encontradas:
            print("\nPizzas não encontradas no script:")
            for nome in nao_encontradas:
                print(f"  - {nome}")
        
        if erros:
            print("\nErros:")
            for nome, erro in erros:
                print(f"  - {nome}: {erro}")
        
        print("\n" + "="*80)
        print("✅ ATUALIZAÇÃO CONCLUÍDA!")
        print("="*80)
        print("\nAgora você pode testar o sistema com pedidos meio a meio!")
        print("Os preços por tamanho estão corretos no banco de dados.\n")

if __name__ == "__main__":
    atualizar_precos()
