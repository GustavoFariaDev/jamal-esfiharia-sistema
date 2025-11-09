#!/usr/bin/env python3
"""
Script para atualizar os beirutes com preços por tamanho (Broto, Médio, Grande)
Baseado nos dados do PDF fornecido
"""
import os
import sys

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from models.esfiha import db, Esfiha

# Dados dos beirutes com preços por tamanho (do PDF)
BEIRUTES_PRECOS = [
    {"nome": "ALADIM", "broto": 38.00, "media": 43.00, "grande": 55.00},
    {"nome": "AGADIR", "broto": 40.00, "media": 45.00, "grande": 68.00},
    {"nome": "BRÓCOLIS", "broto": 48.00, "media": 55.00, "grande": 80.00},
    {"nome": "DA CASA", "broto": 50.00, "media": 60.00, "grande": 90.00},
    {"nome": "EGÍPCIO", "broto": 49.00, "media": 58.00, "grande": 85.00},
    {"nome": "FAQUIR", "broto": 49.00, "media": 60.00, "grande": 85.00},
    {"nome": "FARAÓ", "broto": 40.00, "media": 50.00, "grande": 70.00},
    {"nome": "IPIRANGA", "broto": 40.00, "media": 50.00, "grande": 75.00},
    {"nome": "KALIFA", "broto": 50.00, "media": 60.00, "grande": 80.00},
    {"nome": "KALIFA ESPECIAL", "broto": 60.00, "media": 65.00, "grande": 90.00},
    {"nome": "KARNAK", "broto": 48.00, "media": 54.00, "grande": 75.00},
    {"nome": "LIBANÊS", "broto": 46.00, "media": 55.00, "grande": 80.00},
    {"nome": "MIQUEIRINOS", "broto": 43.00, "media": 48.00, "grande": 70.00},
    {"nome": "NILO", "broto": 40.00, "media": 46.00, "grande": 70.00},
    {"nome": "TEBAS", "broto": 40.00, "media": 50.00, "grande": 70.00},
    {"nome": "VEGETARIANO", "broto": 48.00, "media": 56.00, "grande": 78.00},
]

def atualizar_beirutes():
    """Atualiza os beirutes com preços por tamanho"""
    print("=" * 70)
    print("ATUALIZAÇÃO DE BEIRUTES - SISTEMA DE TAMANHOS")
    print("=" * 70)
    print()
    
    beirutes_atualizados = 0
    beirutes_nao_encontrados = []
    
    for beirute_data in BEIRUTES_PRECOS:
        nome = beirute_data["nome"]
        
        # Buscar beirute no banco
        beirute = Esfiha.query.filter_by(nome=nome, categoria="BEIRUTES").first()
        
        if beirute:
            # Atualizar preços
            beirute.preco_broto = beirute_data["broto"]
            beirute.preco_media = beirute_data["media"]
            beirute.preco_grande = beirute_data["grande"]
            beirute.preco = beirute_data["grande"]  # Preço padrão = Grande
            
            print(f"✓ {nome:20} | Broto: R$ {beirute_data['broto']:6.2f} | Médio: R$ {beirute_data['media']:6.2f} | Grande: R$ {beirute_data['grande']:6.2f}")
            beirutes_atualizados += 1
        else:
            print(f"✗ {nome:20} | NÃO ENCONTRADO")
            beirutes_nao_encontrados.append(nome)
    
    # Salvar alterações
    try:
        db.session.commit()
        print()
        print("=" * 70)
        print(f"✓ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!")
        print(f"  - Beirutes atualizados: {beirutes_atualizados}")
        print(f"  - Beirutes não encontrados: {len(beirutes_nao_encontrados)}")
        
        if beirutes_nao_encontrados:
            print()
            print("⚠ Beirutes não encontrados no banco de dados:")
            for nome in beirutes_nao_encontrados:
                print(f"  - {nome}")
        
        print("=" * 70)
        return True
        
    except Exception as e:
        print()
        print("=" * 70)
        print(f"✗ ERRO AO SALVAR NO BANCO DE DADOS:")
        print(f"  {str(e)}")
        print("=" * 70)
        db.session.rollback()
        return False

def verificar_beirutes():
    """Verifica os beirutes atualizados"""
    print()
    print("=" * 70)
    print("VERIFICAÇÃO DOS BEIRUTES ATUALIZADOS")
    print("=" * 70)
    print()
    
    beirutes = Esfiha.query.filter_by(categoria="BEIRUTES").all()
    
    if not beirutes:
        print("⚠ Nenhum beirute encontrado na categoria BEIRUTES")
        return
    
    print(f"Total de beirutes: {len(beirutes)}")
    print()
    
    for beirute in beirutes:
        print(f"{beirute.nome:20} | Broto: R$ {beirute.preco_broto or 0:6.2f} | Médio: R$ {beirute.preco_media or 0:6.2f} | Grande: R$ {beirute.preco_grande or 0:6.2f}")
    
    print("=" * 70)

if __name__ == '__main__':
    print()
    print("🥙 SISTEMA DE TAMANHOS PARA BEIRUTES")
    print()
    print("Este script irá:")
    print("1. Adicionar preços por tamanho (Broto, Médio, Grande) aos beirutes")
    print("2. Manter o preço 'grande' como preço padrão")
    print("3. Permitir seleção de tamanho no frontend (similar às pizzas)")
    print()
    
    resposta = input("Deseja continuar? (s/n): ").lower()
    
    if resposta == 's':
        if atualizar_beirutes():
            verificar_beirutes()
            print()
            print("✓ Processo concluído! Os beirutes agora possuem sistema de tamanhos.")
            print()
        else:
            print()
            print("✗ Falha na atualização. Verifique os erros acima.")
            print()
            sys.exit(1)
    else:
        print()
        print("Operação cancelada pelo usuário.")
        print()
        sys.exit(0)
