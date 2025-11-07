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
            'endereco_entrega': pedido.endereco,
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
                'categoria': item.esfiha.categoria if item.esfiha else '',
                'acrescimos': []
            }
            
            # Adicionar segunda metade se for meio a meio
            if item.eh_meio_a_meio and item.esfiha_metade2:
                item_data['esfiha_metade2_nome'] = item.esfiha_metade2.nome
            
            # Adicionar acréscimos
            for acrescimo_item in item.acrescimos:
                if acrescimo_item.acrescimo:
                    item_data['acrescimos'].append({
                        'nome': acrescimo_item.acrescimo.nome,
                        'tipo': acrescimo_item.acrescimo.tipo,
                        'preco': float(acrescimo_item.preco_unitario),
                        'quantidade': acrescimo_item.quantidade
                    })
            
            order_data['itens'].append(item_data)
        
        # Realizar impressão
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
        
        return jsonify(response_data), 200 if result['success'] else 500
        
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
        file_path = os.path.join(backend_dir, 'uploads', 'pdfs', filename)
        
        if not os.path.exists(file_path):
            return jsonify({
                'status': 'error',
                'message': 'Arquivo não encontrado'
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
        
        return jsonify(response_data), 200 if result['success'] else 500
        
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
