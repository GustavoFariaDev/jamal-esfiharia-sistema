#!/usr/bin/env python3
"""
Script para atualizar banco de dados com imagens geradas por IA
"""

import sqlite3
import os

# Mapeamento de IDs de produtos para arquivos de imagem IA
imagens_ia = {
    # Batatas
    66: 'ia_prod_66_batata_recheada_peq.jpg',
    67: 'ia_prod_67_batata_recheada_grande.jpg',
    64: 'ia_prod_64_batata_frita_grande.jpg',
    65: 'ia_prod_65_batata_frita_pequena.jpg',
    
    # Beirutes
    48: 'ia_prod_48_aladim_beirute.jpg',
    47: 'ia_prod_47_agadir_beirute.jpg',
    49: 'ia_prod_49_brocolis_beirute.jpg',
    50: 'ia_prod_50_da_casa_beirute.jpg',
    51: 'ia_prod_51_egipcio_beirute.jpg',
    52: 'ia_prod_52_faquir_beirute.jpg',
    54: 'ia_prod_54_farao_beirute_retry.jpg',
    55: 'ia_prod_55_ipiranga_beirute.jpg',
    56: 'ia_prod_56_kalifa_beirute.jpg',
    57: 'ia_prod_57_kalifa_especial_beirute.jpg',
    58: 'ia_prod_58_karnak_beirute.jpg',
    59: 'ia_prod_59_libanes_beirute.jpg',
    60: 'ia_prod_60_miqueirinos_beirute.jpg',
    61: 'ia_prod_61_nilo_beirute.jpg',
    62: 'ia_prod_62_tebas_beirute.jpg',
    63: 'ia_prod_63_vegetariano_beirute.jpg',
    
    # Esfihas Especiais
    153: 'ia_prod_153_carne_seca_catupiry.jpg',
    154: 'ia_prod_154_carne_seca_mussarela.jpg',
    156: 'ia_prod_156_berinjela_catupiry_bacon.jpg',
    200: 'ia_prod_200_moda_casa_esfiha.jpg',
    201: 'ia_prod_201_file_gorgonzola_esfiha.jpg',
    202: 'ia_prod_202_carne_seca_brocolis_esfiha.jpg',
    203: 'ia_prod_203_carne_seca_catupiry_esfiha.jpg',
    204: 'ia_prod_204_carne_seca_ovo_esfiha.jpg',
    205: 'ia_prod_205_quatro_queijos_bacon_esfiha.jpg',
    289: 'ia_prod_289_file_mignon_gorgonzola.jpg',
    290: 'ia_prod_290_carne_seca_brocolis_bacon.jpg',
    
    # Esfihas Doces
    184: 'ia_prod_184_kitkat_esfiha_doce.jpg',
    185: 'ia_prod_185_morango_esfiha_doce.jpg',
    186: 'ia_prod_186_leite_ninho_esfiha_doce.jpg',
    187: 'ia_prod_187_banana_esfiha_doce.jpg',
    188: 'ia_prod_188_mms_esfiha_doce.jpg',
    
    # Pizzas
    29: 'ia_prod_29_moda_casa_pizza.jpg',
    474: 'ia_prod_474_prestigio_pizza_doce.jpg',
    
    # Fogazzes Especiais
    461: 'ia_prod_461_moda_casa_fogazza.jpg',
    462: 'ia_prod_462_file_gorgonzola_fogazza.jpg',
    463: 'ia_prod_463_carne_seca_brocolis_fogazza.jpg',
    464: 'ia_prod_464_carne_seca_catupiry_fogazza.jpg',
    465: 'ia_prod_465_carne_seca_ovo_fogazza.jpg',
    466: 'ia_prod_466_quatro_queijos_bacon_fogazza.jpg',
    
    # Fogazzes Salgadas
    391: 'ia_prod_391_file_mussarela_fogazza.jpg',
    392: 'ia_prod_392_file_catupiry_fogazza.jpg',
    336: 'ia_prod_336_carne_seca_brocolis_fogazza_salgada.jpg',
    
    # Fogazzes Doces
    445: 'ia_prod_445_kitkat_fogazza_doce.jpg',
    446: 'ia_prod_446_morango_fogazza_doce.jpg',
}

def atualizar_banco():
    conn = sqlite3.connect('instance/jamal.db')
    cursor = conn.cursor()
    
    atualizados = 0
    nao_encontrados = []
    
    for produto_id, imagem_arquivo in imagens_ia.items():
        # Verificar se o arquivo existe
        caminho_completo = f'static/uploads/{imagem_arquivo}'
        if not os.path.exists(caminho_completo):
            nao_encontrados.append(f"ID {produto_id}: {imagem_arquivo}")
            continue
        
        # Atualizar no banco
        cursor.execute("""
            UPDATE esfiha 
            SET imagem_url = ? 
            WHERE id = ?
        """, (imagem_arquivo, produto_id))
        
        if cursor.rowcount > 0:
            atualizados += 1
            # Buscar nome do produto
            cursor.execute("SELECT nome FROM esfiha WHERE id = ?", (produto_id,))
            nome = cursor.fetchone()[0]
            print(f"✓ ID {produto_id:3d}: {nome[:40]:40s} -> {imagem_arquivo}")
        else:
            print(f"✗ ID {produto_id} não encontrado no banco")
    
    conn.commit()
    conn.close()
    
    print("\n" + "="*80)
    print(f"✓ Total atualizado: {atualizados} produtos")
    
    if nao_encontrados:
        print(f"\n✗ Arquivos não encontrados ({len(nao_encontrados)}):")
        for item in nao_encontrados:
            print(f"  - {item}")
    
    return atualizados

if __name__ == "__main__":
    print("="*80)
    print("ATUALIZANDO BANCO DE DADOS COM IMAGENS IA")
    print("="*80)
    atualizados = atualizar_banco()
    print("="*80)
    print(f"✓ CONCLUÍDO: {atualizados} produtos atualizados com imagens IA")
    print("="*80)
