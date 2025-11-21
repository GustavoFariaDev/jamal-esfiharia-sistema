"""
Rotas para impressão de pedidos
"""

import os
from flask import Blueprint, request, jsonify, send_file
from src.middleware.auth import admin_required
from src.models.pedido import Pedido
from src.models.user import db
from src.services.printer_enhanced import PrinterService

print_bp = Blueprint('print', __name__)
printer_service = PrinterService()

@print_bp.route('/pedido/<int:pedido_id>/imprimir', methods=['POST'])
@admin_required
def imprimir_pedido(pedido_id):
    """Imprime um pedido específico"""
    try:
        # Buscar pedido no banco
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            return jsonify({
                'status': 'error',
                'message': 'Pedido não encontrado'
            }), 404
        
        # Obter tipo de impressão
        data = request.get_json() or {}
        print_type = data.get('tipo', 'pdf')  # thermal, pdf, both (padrão: pdf)
        
        if print_type not in ['thermal', 'pdf', 'both']:
            return jsonify({
                'status': 'error',
                'message': 'Tipo de impressão inválido. Use: thermal, pdf ou both'
            }), 400
        
        # Preparar dados do pedido para impressão
        order_data = {
            'id': pedido.id,
            'cliente_nome': pedido.nome_cliente,
            'cliente_telefone': pedido.telefone,
            'status': pedido.status,
            'observacoes': pedido.observacoes,
            'tipo_entrega': pedido.forma_entrega,
            'endereco': pedido.endereco,
            'complemento': pedido.complemento,
            'cep_entrega': pedido.cep_entrega,
            'distancia_km': float(pedido.distancia_km) if pedido.distancia_km else None,
            'taxa_entrega': float(pedido.taxa_entrega),
            'forma_pagamento': pedido.forma_pagamento,
            'troco_para': float(pedido.troco_para) if pedido.troco_para else None,
            'valor_total': float(pedido.valor_total),
            'itens': []
        }
        
        # Adicionar itens do pedido com acréscimos
        for item in pedido.itens:
            item_data = {
                'esfiha_nome': item.esfiha.nome if item.esfiha else 'Item removido',
                'quantidade': item.quantidade,
                'preco_unitario': float(item.preco_unitario),
                'eh_meio_a_meio': item.eh_meio_a_meio,
                'tamanho': item.tamanho,
                'tipo_massa': item.tipo_massa,
                'categoria': item.esfiha.categoria if item.esfiha else '',
                'acrescimos': []
            }
            
            # Adicionar segunda metade se for meio a meio
            if item.eh_meio_a_meio and item.esfiha_metade2:
                item_data['esfiha_metade2_nome'] = item.esfiha_metade2.nome
            
            # Adicionar acréscimos
            for acrescimo_item in item.acrescimos:
                # Garantir que acréscimos sempre apareçam, mesmo se o acréscimo foi deletado
                if acrescimo_item.acrescimo:
                    item_data['acrescimos'].append({
                        'nome': acrescimo_item.acrescimo.nome,
                        'tipo': acrescimo_item.acrescimo.tipo,
                        'preco': float(acrescimo_item.preco_unitario),
                        'quantidade': acrescimo_item.quantidade
                    })
                else:
                    # Acréscimo foi deletado, mas ainda mostrar no pedido histórico
                    item_data['acrescimos'].append({
                        'nome': f'Acréscimo #{acrescimo_item.acrescimo_id}',
                        'tipo': 'outro',
                        'preco': float(acrescimo_item.preco_unitario),
                        'quantidade': acrescimo_item.quantidade
                    })
            
            order_data['itens'].append(item_data)
        
        # Realizar impressão
        result = printer_service.print_order(order_data, print_type)
        
        print(f"\n=== RESULTADO DA IMPRESSÃO ===")
        print(f"Success: {result['success']}")
        print(f"PDF Success: {result['pdf_success']}")
        print(f"PDF Filename: {result.get('pdf_filename')}")
        print(f"PDF Path: {result.get('pdf_path')}")
        
        response_data = {
            'status': 'success' if result['success'] else 'error',
            'message': result['message'],
            'thermal_success': result['thermal_success'],
            'pdf_success': result['pdf_success']
        }
        
        # Se gerou PDF, incluir link para download
        if result.get('pdf_filename'):
            pdf_url = f"/api/print/download/{result['pdf_filename']}"
            response_data['pdf_url'] = pdf_url
            response_data['pdf_filename'] = result['pdf_filename']
            print(f"PDF URL gerada: {pdf_url}")
        
        # Retorna 200 se o PDF foi gerado com sucesso, mesmo que a térmica tenha falhado.
        # Se a térmica falhou e o PDF também, retorna 500.
        status_code = 200 if result['pdf_success'] or result['thermal_success'] else 500
        return jsonify(response_data), status_code
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro interno: {str(e)}'
        }), 500

@print_bp.route('/download/<filename>', methods=['GET'])
def download_pdf(filename):
    """Download de PDF gerado"""
    try:
        # Obter caminho absoluto do backend
        basedir = os.path.abspath(os.path.dirname(__file__))
        backend_dir = os.path.dirname(os.path.dirname(basedir))
        pdf_dir = os.path.join(backend_dir, 'uploads', 'pdfs')
        file_path = os.path.join(pdf_dir, filename)
        
        print(f"\n=== DOWNLOAD PDF ===")
        print(f"Filename solicitado: {filename}")
        print(f"Basedir: {basedir}")
        print(f"Backend dir: {backend_dir}")
        print(f"PDF dir: {pdf_dir}")
        print(f"File path: {file_path}")
        print(f"PDF dir existe? {os.path.exists(pdf_dir)}")
        print(f"Arquivo existe? {os.path.exists(file_path)}")
        
        # Listar arquivos no diretório
        if os.path.exists(pdf_dir):
            arquivos = os.listdir(pdf_dir)
            print(f"Arquivos no diretório: {arquivos}")
        else:
            print("Diretório de PDFs não existe!")
        
        if not os.path.exists(file_path):
            return jsonify({
                'status': 'error',
                'message': f'Arquivo não encontrado: {filename}',
                'debug': {
                    'file_path': file_path,
                    'pdf_dir_exists': os.path.exists(pdf_dir),
                    'files_in_dir': os.listdir(pdf_dir) if os.path.exists(pdf_dir) else []
                }
            }), 404
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao baixar arquivo: {str(e)}'
        }), 500

@print_bp.route('/impressoras', methods=['GET'])
@admin_required
def listar_impressoras():
    """Lista impressoras disponíveis"""
    try:
        impressoras = printer_service.get_available_printers()
        
        return jsonify({
            'status': 'success',
            'impressoras': impressoras,
            'total': len(impressoras)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao listar impressoras: {str(e)}'
        }), 500

@print_bp.route('/teste', methods=['POST'])
@admin_required
def imprimir_teste():
    """Imprime um pedido de teste"""
    try:
        data = request.get_json() or {}
        print_type = data.get('tipo', 'thermal')
        
        if print_type not in ['thermal', 'pdf', 'both']:
            return jsonify({
                'status': 'error',
                'message': 'Tipo de impressão inválido. Use: thermal, pdf ou both'
            }), 400
        
        # Dados de teste
        order_data = {
            'id': 'TESTE',
            'cliente_nome': 'Cliente Teste',
            'cliente_telefone': '(11) 99999-9999',
            'status': 'Teste',
            'observacoes': 'Este é um pedido de teste para verificar a impressão.\nSem cebola, por favor.',
            'tipo_entrega': 'delivery',
            'endereco': 'Rua Teste, 123 - Bairro Teste',
            'complemento': 'Apto 42',
            'cep_entrega': '01234-567',
            'taxa_entrega': 5.00,
            'forma_pagamento': 'dinheiro',
            'troco_para': 50.00,
            'valor_total': 45.50,
            'itens': [
                {
                    'esfiha_nome': 'Esfiha de Carne',
                    'quantidade': 3,
                    'preco_unitario': 5.50
                },
                {
                    'esfiha_nome': 'Esfiha de Queijo',
                    'quantidade': 2,
                    'preco_unitario': 5.00
                },
                {
                    'esfiha_nome': 'Esfiha de Frango',
                    'quantidade': 1,
                    'preco_unitario': 6.00
                }
            ]
        }
        
        # Realizar impressão de teste
        result = printer_service.print_order(order_data, print_type)
        
        response_data = {
            'status': 'success' if result['success'] else 'error',
            'message': result['message'],
            'thermal_success': result['thermal_success'],
            'pdf_success': result['pdf_success']
        }
        
        # Se gerou PDF, incluir link para download
        if result.get('pdf_filename'):
            response_data['pdf_url'] = f"/api/print/download/{result['pdf_filename']}"
            response_data['pdf_filename'] = result['pdf_filename']
        
        # Retorna 200 se o PDF foi gerado com sucesso, mesmo que a térmica tenha falhado.
        # Se a térmica falhou e o PDF também, retorna 500.
        status_code = 200 if result['pdf_success'] or result['thermal_success'] else 500
        return jsonify(response_data), status_code
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro interno: {str(e)}'
        }), 500

@print_bp.route('/configuracao', methods=['GET', 'POST'])
@admin_required
def configuracao_impressao():
    """Gerencia configurações de impressão"""
    if request.method == 'GET':
        # Retorna configurações atuais
        try:
            impressoras = printer_service.get_available_printers()
            impressora_atual = printer_service.thermal_printer.printer_name
            
            return jsonify({
                'status': 'success',
                'configuracao': {
                    'impressora_atual': impressora_atual,
                    'impressoras_disponiveis': impressoras,
                    'largura_termica': printer_service.thermal_printer.width
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Erro ao obter configurações: {str(e)}'
            }), 500
    
    else:  # POST
        # Atualiza configurações
        try:
            data = request.get_json() or {}
            
            if 'impressora' in data:
                printer_service.thermal_printer.printer_name = data['impressora']
            
            if 'largura' in data:
                largura = int(data['largura'])
                if 20 <= largura <= 80:  # Validação básica
                    printer_service.thermal_printer.width = largura
                else:
                    return jsonify({
                        'status': 'error',
                        'message': 'Largura deve estar entre 20 e 80 caracteres'
                    }), 400
            
            return jsonify({
                'status': 'success',
                'message': 'Configurações atualizadas com sucesso'
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Erro ao atualizar configurações: {str(e)}'
            }), 500
