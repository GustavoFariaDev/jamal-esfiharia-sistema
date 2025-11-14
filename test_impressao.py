#!/usr/bin/env python3
"""
Script de teste para validar impressões com endereço completo
"""

import sys
import os

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from src.services.printer_enhanced import ThermalPrinter, PDFPrinter

# Dados de teste com endereço completo
order_data_teste = {
    'id': 22,
    'cliente_nome': 'Gus',
    'cliente_telefone': '11 979614112',
    'status': 'PENDENTE',
    'observacoes': 'sem rebolho',
    'tipo_entrega': 'delivery',
    'endereco': 'Rua Paulo di Favari, Rudge Ramos - São Bernardo do Campo/SP',
    'complemento': 'ap 321',
    'cep_entrega': '09618-100',
    'distancia_km': 4.8,
    'taxa_entrega': 7.00,
    'forma_pagamento': 'pix',
    'troco_para': None,
    'valor_total': 16.00,
    'itens': [
        {
            'esfiha_nome': 'ALHO C/ MUSSARELA',
            'quantidade': 1,
            'preco_unitario': 9.00,
            'eh_meio_a_meio': False,
            'tamanho': None,
            'categoria': 'ESFIHA SALGADA',
            'acrescimos': []
        }
    ]
}

def testar_impressao_termica():
    """Testa a formatação da impressão térmica"""
    print("=" * 60)
    print("TESTE DE IMPRESSÃO TÉRMICA")
    print("=" * 60)
    
    thermal_printer = ThermalPrinter()
    receipt_text = thermal_printer.format_order_receipt(order_data_teste)
    
    print(receipt_text)
    print("\n" + "=" * 60)
    
    # Verificar se o endereço está presente
    if 'Rua Paulo di Favari' in receipt_text:
        print("✅ ENDEREÇO ENCONTRADO NA IMPRESSÃO TÉRMICA")
    else:
        print("❌ ENDEREÇO NÃO ENCONTRADO NA IMPRESSÃO TÉRMICA")
    
    if 'CEP: 09618-100' in receipt_text:
        print("✅ CEP ENCONTRADO NA IMPRESSÃO TÉRMICA")
    else:
        print("❌ CEP NÃO ENCONTRADO NA IMPRESSÃO TÉRMICA")
    
    if 'ap 321' in receipt_text:
        print("✅ COMPLEMENTO ENCONTRADO NA IMPRESSÃO TÉRMICA")
    else:
        print("❌ COMPLEMENTO NÃO ENCONTRADO NA IMPRESSÃO TÉRMICA")
    
    if '4.8 km' in receipt_text:
        print("✅ DISTÂNCIA ENCONTRADA NA IMPRESSÃO TÉRMICA")
    else:
        print("❌ DISTÂNCIA NÃO ENCONTRADA NA IMPRESSÃO TÉRMICA")
    
    print("=" * 60)

def testar_impressao_pdf():
    """Testa a geração de PDF"""
    print("\n" + "=" * 60)
    print("TESTE DE IMPRESSÃO PDF")
    print("=" * 60)
    
    pdf_printer = PDFPrinter()
    output_path = '/home/ubuntu/test_pedido.pdf'
    
    success = pdf_printer.create_order_pdf(order_data_teste, output_path)
    
    if success and os.path.exists(output_path):
        print(f"✅ PDF GERADO COM SUCESSO: {output_path}")
        print(f"   Tamanho: {os.path.getsize(output_path)} bytes")
        
        # Verificar conteúdo do PDF (básico)
        with open(output_path, 'rb') as f:
            pdf_content = f.read().decode('latin-1', errors='ignore')
            
            if 'Rua Paulo di Favari' in pdf_content:
                print("✅ ENDEREÇO ENCONTRADO NO PDF")
            else:
                print("❌ ENDEREÇO NÃO ENCONTRADO NO PDF")
            
            if '09618-100' in pdf_content:
                print("✅ CEP ENCONTRADO NO PDF")
            else:
                print("❌ CEP NÃO ENCONTRADO NO PDF")
            
            if 'ap 321' in pdf_content:
                print("✅ COMPLEMENTO ENCONTRADO NO PDF")
            else:
                print("❌ COMPLEMENTO NÃO ENCONTRADO NO PDF")
    else:
        print("❌ ERRO AO GERAR PDF")
    
    print("=" * 60)

if __name__ == '__main__':
    print("\n🧪 INICIANDO TESTES DE IMPRESSÃO\n")
    
    testar_impressao_termica()
    testar_impressao_pdf()
    
    print("\n✅ TESTES CONCLUÍDOS!\n")
