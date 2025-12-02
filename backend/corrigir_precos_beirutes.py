#!/usr/bin/env python3
"""
Script para corrigir preços dos beirutes no Render
Identifica beirutes com preços fora do padrão e os corrige
"""
import os
import sys

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app
from src.models.esfiha import db, Esfiha

# Preços corretos dos beirutes (conforme arquivo Word)
BEIRUTES_PRECOS_CORRETOS = {
    "ALADIM": {"broto": 38.00, "media": 43.00, "grande": 55.00},
    "AGADIR": {"broto": 40.00, "media": 45.00, "grande": 68.00},
    "BRÓCOLIS": {"broto": 48.00, "media": 55.00, "grande": 80.00},
    "DA CASA": {"broto": 50.00, "media": 60.00, "grande": 90.00},
    "EGÍPCIO": {"broto": 49.00, "media": 58.00, "grande": 85.00},
    "FAQUIR": {"broto": 49.00, "media": 60.00, "grande": 85.00},
    "FARAÓ": {"broto": 40.00, "media": 50.00, "grande": 70.00},
    "IPIRANGA": {"broto": 40.00, "media": 50.00, "grande": 75.00},
    "KALIFA": {"broto": 50.00, "media": 60.00, "grande": 80.00},
    "KALIFA ESPECIAL": {"broto": 60.00, "media": 65.00, "grande": 90.00},
    "KARNAK": {"broto": 48.00, "media": 54.00, "grande": 75.00},
    "LIBANÊS": {"broto": 46.00, "media": 55.00, "grande": 80.00},
    "MIQUEIRINOS": {"broto": 43.00, "media": 48.00, "grande": 70.00},
    "NILO": {"broto": 40.00, "media": 46.00, "grande": 70.00},
    "TEBAS": {"broto": 40.00, "media": 50.00, "grande": 70.00},
    "VEGETARIANO": {"broto": 48.00, "media": 56.00, "grande": 78.00},
}

def verificar_beirutes():
    """Verifica os preços atuais dos beirutes"""
    print("=" * 80)
    print("VERIFICAÇÃO DE PREÇOS DOS BEIRUTES")
    print("=" * 80)
    print()
    
    beirutes = Esfiha.query.filter_by(categoria="BEIRUTES").all()
    
    if not beirutes:
        print("⚠️  Nenhum beirute encontrado na categoria BEIRUTES")
        return []
    
    print(f"Total de beirutes encontrados: {len(beirutes)}")
    print()
    
    beirutes_incorretos = []
    
    print(f"{'Nome':<20} | {'Broto':<10} | {'Médio':<10} | {'Grande':<10} | Status")
    print("-" * 80)
    
    for beirute in beirutes:
        precos_corretos = BEIRUTES_PRECOS_CORRETOS.get(beirute.nome)
        
        if not precos_corretos:
            print(f"{beirute.nome:<20} | {'N/A':<10} | {'N/A':<10} | {'N/A':<10} | ⚠️  NÃO ENCONTRADO NA LISTA")
            continue
        
        # Verificar se os preços estão corretos
        broto_correto = beirute.preco_broto == precos_corretos["broto"]
        media_correto = beirute.preco_media == precos_corretos["media"]
        grande_correto = beirute.preco_grande == precos_corretos["grande"]
        
        status = "✓ OK" if (broto_correto and media_correto and grande_correto) else "✗ INCORRETO"
        
        print(f"{beirute.nome:<20} | R$ {beirute.preco_broto or 0:<7.2f} | R$ {beirute.preco_media or 0:<7.2f} | R$ {beirute.preco_grande or 0:<7.2f} | {status}")
        
        if not (broto_correto and media_correto and grande_correto):
            beirutes_incorretos.append({
                'beirute': beirute,
                'precos_corretos': precos_corretos
            })
    
    print()
    print("=" * 80)
    
    return beirutes_incorretos

def corrigir_beirutes(beirutes_incorretos):
    """Corrige os preços dos beirutes incorretos"""
    if not beirutes_incorretos:
        print("✓ Todos os beirutes estão com preços corretos!")
        return 0
    
    print()
    print("=" * 80)
    print("CORREÇÃO DE PREÇOS")
    print("=" * 80)
    print()
    
    print(f"Total de beirutes a corrigir: {len(beirutes_incorretos)}")
    print()
    
    for item in beirutes_incorretos:
        beirute = item['beirute']
        precos_corretos = item['precos_corretos']
        
        print(f"Corrigindo: {beirute.nome}")
        print(f"  Broto:  R$ {beirute.preco_broto or 0:.2f} → R$ {precos_corretos['broto']:.2f}")
        print(f"  Médio:  R$ {beirute.preco_media or 0:.2f} → R$ {precos_corretos['media']:.2f}")
        print(f"  Grande: R$ {beirute.preco_grande or 0:.2f} → R$ {precos_corretos['grande']:.2f}")
        
        # Atualizar preços
        beirute.preco_broto = precos_corretos["broto"]
        beirute.preco_media = precos_corretos["media"]
        beirute.preco_grande = precos_corretos["grande"]
        beirute.preco = precos_corretos["grande"]  # Preço padrão = Grande
        
        print()
    
    # Salvar alterações
    try:
        db.session.commit()
        print("=" * 80)
        print(f"✓ CORREÇÃO CONCLUÍDA COM SUCESSO!")
        print(f"  - Beirutes corrigidos: {len(beirutes_incorretos)}")
        print("=" * 80)
        return len(beirutes_incorretos)
    except Exception as e:
        print("=" * 80)
        print(f"✗ ERRO AO SALVAR NO BANCO DE DADOS:")
        print(f"  {str(e)}")
        print("=" * 80)
        db.session.rollback()
        return 0

if __name__ == '__main__':
    print()
    print("🥙 CORREÇÃO DE PREÇOS DOS BEIRUTES")
    print()
    
    # Criar aplicação
    app = create_app()
    
    with app.app_context():
        # Verificar preços
        beirutes_incorretos = verificar_beirutes()
        
        # Se houver beirutes incorretos, perguntar se deseja corrigir
        if beirutes_incorretos:
            print()
            resposta = input("Deseja corrigir os preços? (s/n): ").lower()
            
            if resposta == 's':
                corrigidos = corrigir_beirutes(beirutes_incorretos)
                
                # Verificar novamente após correção
                print()
                print("Verificando preços após correção...")
                print()
                verificar_beirutes()
                
                if corrigidos > 0:
                    print()
                    print("✓ Processo concluído! Os beirutes foram corrigidos.")
                    print()
                else:
                    print()
                    print("✗ Falha na correção. Verifique os erros acima.")
                    print()
                    sys.exit(1)
            else:
                print()
                print("Operação cancelada pelo usuário.")
                print()
        else:
            print()
            print("✓ Nenhuma correção necessária!")
            print()
