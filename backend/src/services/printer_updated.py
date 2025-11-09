"""
Módulo de impressão ATUALIZADO para pedidos da Esfiharia Jamal
Inclui suporte para: tamanhos, acréscimos e pizza meio a meio
"""

import os
import platform
import subprocess
import tempfile
from datetime import datetime
from typing import Dict, List, Optional
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class ThermalPrinter:
    """Classe para impressão em impressoras térmicas"""
    
    def __init__(self, printer_name: Optional[str] = None):
        self.printer_name = printer_name or self._detect_thermal_printer()
        self.width = 48  # Largura padrão em caracteres para impressora térmica
        
    def _detect_thermal_printer(self) -> Optional[str]:
        """Detecta impressoras térmicas disponíveis"""
        system = platform.system()
        
        if system == "Windows":
            try:
                result = subprocess.run(
                    ['wmic', 'printer', 'get', 'name'], 
                    capture_output=True, text=True
                )
                printers = result.stdout.split('\n')[1:]
                
                thermal_keywords = ['bematech', 'thermal', 'mp-4200', 'mp4200', 'pos']
                for printer in printers:
                    printer = printer.strip()
                    if any(keyword in printer.lower() for keyword in thermal_keywords):
                        return printer
                        
                for printer in printers:
                    printer = printer.strip()
                    if printer and printer != 'Name':
                        return printer
                        
            except Exception as e:
                print(f"Erro ao detectar impressora Windows: {e}")
                
        elif system == "Linux":
            try:
                result = subprocess.run(['lpstat', '-p'], capture_output=True, text=True)
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'printer' in line and 'is idle' in line:
                        printer = line.split()[1]
                        return printer
            except Exception as e:
                print(f"Erro ao detectar impressora Linux: {e}")
                
        return None
    
    def _format_line(self, text: str, width: Optional[int] = None) -> str:
        """Formata uma linha para impressão térmica"""
        if width is None:
            width = self.width
        return text[:width].ljust(width)
    
    def _center_text(self, text: str, width: Optional[int] = None) -> str:
        """Centraliza texto"""
        if width is None:
            width = self.width
        return text.center(width)
    
    def _separator_line(self, char: str = "-", width: Optional[int] = None) -> str:
        """Cria linha separadora"""
        if width is None:
            width = self.width
        return char * width
    
    def _format_tamanho(self, tamanho: Optional[str]) -> str:
        """Formata o tamanho para exibição"""
        if not tamanho:
            return ""
        
        tamanhos_map = {
            'grande': 'GRANDE',
            'media': 'MÉDIA',
            'medio': 'MÉDIO',
            'broto': 'BROTO',
            'pequena': 'PEQUENA'
        }
        
        return f" ({tamanhos_map.get(tamanho.lower(), tamanho.upper())})"
    
    def format_order_receipt(self, order_data: Dict) -> str:
        """Formata recibo do pedido para impressão térmica - VERSÃO ATUALIZADA"""
        lines = []
        
        # Cabeçalho
        lines.append(self._center_text("ESFIHARIA JAMAL"))
        lines.append(self._center_text("Av. Gago Coutinho, 310"))
        lines.append(self._center_text("Santa Maria, Santo Andre - SP"))
        lines.append(self._center_text("CEP: 09070-000"))
        lines.append(self._center_text("Tel: (11) 93333-1106"))
        lines.append(self._separator_line("="))
        lines.append("")
        
        # Informações do pedido
        lines.append(f"PEDIDO: #{order_data.get('id', 'N/A')}")
        lines.append(f"DATA: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        lines.append(f"CLIENTE: {order_data.get('cliente_nome', 'N/A')}")
        if order_data.get('cliente_telefone'):
            lines.append(f"FONE: {order_data['cliente_telefone']}")
        if order_data.get('endereco'):
            lines.append(f"ENDERECO: {order_data['endereco']}")
        lines.append(self._separator_line("-"))
        lines.append("")
        
        # Itens do pedido
        lines.append("ITENS:")
        lines.append("")
        total = 0
        
        for item in order_data.get('itens', []):
            nome = item.get('esfiha_nome', 'Item')[:30]
            qtd = item.get('quantidade', 1)
            preco_base = float(item.get('preco_unitario', 0))
            categoria = item.get('categoria', '')
            
            # Verificar se é meio a meio
            eh_meio_a_meio = item.get('eh_meio_a_meio', False)
            tamanho = item.get('tamanho', '')
            
            if eh_meio_a_meio:
                # Pizza meio a meio
                metade2_nome = item.get('esfiha_metade2_nome', 'Outro sabor')
                tamanho_str = self._format_tamanho(tamanho)
                
                lines.append(f"{qtd}x Pizza MEIO A MEIO{tamanho_str}")
                lines.append(f"   Metade 1: {nome[:25]}")
                lines.append(f"   Metade 2: {metade2_nome[:25]}")
                lines.append(f"   R$ {preco_base:.2f}")
            else:
                # Produto normal
                tamanho_str = self._format_tamanho(tamanho)
                lines.append(f"{qtd}x {nome}{tamanho_str}")
                
                # Para esfihas, adicionar tipo (aberta/fechada)
                if categoria and 'ESFIHA' in categoria.upper():
                    tipo_esfiha = "Aberta" if "SALGADA" in categoria.upper() or "VEGETARIANA" in categoria.upper() else "Fechada"
                    lines.append(f"   ({tipo_esfiha})")
                
                lines.append(f"   R$ {preco_base:.2f}")
            
            # Acréscimos
            acrescimos = item.get('acrescimos', [])
            if acrescimos:
                # Se for esfiha e tiver acréscimos, mostrar contagem
                if categoria and 'ESFIHA' in categoria.upper() and qtd > 1:
                    qtd_com_acrescimo = sum(a.get('quantidade', 1) for a in acrescimos if a.get('tipo') == 'esfiha')
                    if qtd_com_acrescimo > 0 and qtd_com_acrescimo < qtd:
                        qtd_sem_acrescimo = qtd - qtd_com_acrescimo
                        lines.append(f"   [{qtd_com_acrescimo} c/ acréscimo, {qtd_sem_acrescimo} normal]")
                    elif qtd_com_acrescimo >= qtd:
                        lines.append(f"   [Todas c/ acréscimo]")
                
                lines.append("")
                lines.append("   + ACRESCIMOS:")
                valor_acrescimos = 0
                
                for acrescimo in acrescimos:
                    nome_acr = acrescimo.get('nome', 'Acréscimo')[:25]
                    tipo_acr = acrescimo.get('tipo', '')
                    preco_acr = float(acrescimo.get('preco', 0))
                    valor_acrescimos += preco_acr
                    
                    # Formatar tipo de acréscimo
                    tipo_label = ""
                    prefixo = ""
                    
                    if tipo_acr == 'pizza_metade':
                        tipo_label = " (Metade)"
                    elif tipo_acr == 'pizza_toda':
                        tipo_label = " (Pizza Toda)"
                    elif tipo_acr == 'borda':
                        # Para bordas, adicionar prefixo "Borda"
                        if 'Borda' not in nome_acr:
                            prefixo = "Borda "
                        else:
                            nome_acr = nome_acr.replace('Borda de ', '')
                        tipo_label = ""
                    
                    lines.append(f"   • {prefixo}{nome_acr}{tipo_label}")
                    lines.append(f"     R$ {preco_acr:.2f}")
                
                lines.append("")
                subtotal_item = (preco_base + valor_acrescimos) * qtd
                lines.append(f"   Subtotal: R$ {subtotal_item:.2f}")
            else:
                subtotal_item = preco_base * qtd
                if qtd > 1:
                    lines.append(f"   = R$ {subtotal_item:.2f}")
            
            total += subtotal_item if acrescimos else (preco_base * qtd)
            lines.append("")
        
        lines.append(self._separator_line("-"))
        
        # Subtotal e taxas
        lines.append(f"SUBTOTAL: R$ {total:.2f}")
        
        # Taxa de entrega
        taxa_entrega = float(order_data.get('taxa_entrega', 0))
        if taxa_entrega > 0:
            lines.append(f"TAXA ENTREGA: R$ {taxa_entrega:.2f}")
            total += taxa_entrega
        
        lines.append(self._separator_line("="))
        lines.append(f"TOTAL: R$ {total:.2f}")
        lines.append(self._separator_line("="))
        lines.append("")
        
        # Status
        status = order_data.get('status', 'Pendente')
        lines.append(f"STATUS: {status.upper()}")
        lines.append("")
        
        # Tipo de entrega
        tipo_entrega = order_data.get('tipo_entrega', 'retirada')
        if tipo_entrega in ['delivery', 'entrega']:
            lines.append("TIPO: DELIVERY")
            if order_data.get('endereco_entrega'):
                endereco = order_data['endereco_entrega']
                lines.append("ENDERECO:")
                # Quebrar endereço em linhas
                while len(endereco) > self.width:
                    lines.append(endereco[:self.width])
                    endereco = endereco[self.width:]
                if endereco:
                    lines.append(endereco)
            
            distancia = order_data.get('distancia_km')
            if distancia:
                lines.append(f"DISTANCIA: {distancia:.1f} km")
            lines.append("")
        else:
            lines.append("TIPO: RETIRADA")
            lines.append("")
        
        # Forma de pagamento
        forma_pagamento = order_data.get('forma_pagamento', 'dinheiro')
        forma_map = {
            'dinheiro': 'DINHEIRO',
            'cartao_credito': 'CARTAO DE CREDITO',
            'cartao_debito': 'CARTAO DE DEBITO',
            'pix': 'PIX'
        }
        lines.append(f"PAGAMENTO: {forma_map.get(forma_pagamento, forma_pagamento.upper())}")
        
        # Troco
        troco_para = order_data.get('troco_para')
        if troco_para and forma_pagamento == 'dinheiro':
            troco = float(troco_para) - total
            lines.append(f"TROCO PARA: R$ {float(troco_para):.2f}")
            lines.append(f"TROCO: R$ {troco:.2f}")
        
        lines.append("")
        
        # Observações
        if order_data.get('observacoes'):
            lines.append("OBSERVACOES:")
            obs_lines = order_data['observacoes'].split('\n')
            for obs_line in obs_lines:
                while len(obs_line) > self.width:
                    lines.append(obs_line[:self.width])
                    obs_line = obs_line[self.width:]
                if obs_line:
                    lines.append(obs_line)
            lines.append("")
        
        lines.append(self._center_text("OBRIGADO PELA PREFERENCIA!"))
        lines.append("")
        lines.append("")  # Espaço para corte
        
        return "\n".join(lines)
    
    def print_order(self, order_data: Dict) -> bool:
        """Imprime pedido na impressora térmica"""
        try:
            if not self.printer_name:
                raise Exception("Nenhuma impressora encontrada")
            
            receipt_text = self.format_order_receipt(order_data)
            
            # Criar arquivo temporário
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt', encoding='utf-8') as temp_file:
                temp_file.write(receipt_text)
                temp_file_path = temp_file.name
            
            # Imprimir
            system = platform.system()
            if system == "Windows":
                subprocess.run([
                    'notepad', '/p', temp_file_path
                ], check=True)
            else:
                # Linux - usa lp
                subprocess.run([
                    'lp', '-d', self.printer_name, temp_file_path
                ], check=True)
                
            # Remover arquivo temporário
            os.unlink(temp_file_path)
            return True
            
        except Exception as e:
            print(f"Erro ao imprimir: {e}")
            return False


class PDFPrinter:
    """Classe para impressão em PDF"""
    
    def create_order_pdf(self, order_data: Dict, output_path: str) -> bool:
        """Cria PDF do pedido - VERSÃO ATUALIZADA"""
        try:
            doc = SimpleDocTemplate(output_path, pagesize=A4)
            elements = []
            styles = getSampleStyleSheet()
            
            # Estilo customizado
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.HexColor('#2c3e50'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            # Cabeçalho
            elements.append(Paragraph("ESFIHARIA JAMAL", title_style))
            elements.append(Paragraph("Av. Gago Coutinho, 310 - Santa Maria, Santo André - SP", styles['Normal']))
            elements.append(Paragraph("CEP: 09070-000 - Tel: (11) 93333-1106", styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Informações do pedido
            info_data = [
                ['Pedido:', f"#{order_data.get('id', 'N/A')}"],
                ['Data:', datetime.now().strftime('%d/%m/%Y %H:%M')],
                ['Cliente:', order_data.get('cliente_nome', 'N/A')],
                ['Telefone:', order_data.get('cliente_telefone', 'N/A')],
            ]
            
            # Adicionar endereço se existir
            if order_data.get('endereco'):
                info_data.append(['Endereço:', order_data.get('endereco')])
            
            info_table = Table(info_data, colWidths=[100, 300])
            info_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ]))
            
            elements.append(info_table)
            elements.append(Spacer(1, 20))
            
            # Tabela de itens
            items_data = [['Qtd', 'Item', 'Preço Unit.', 'Subtotal']]
            total = 0
            
            for item in order_data.get('itens', []):
                nome = item.get('esfiha_nome', 'Item')
                qtd = item.get('quantidade', 1)
                preco_base = float(item.get('preco_unitario', 0))
                
                # Verificar meio a meio e tamanho
                eh_meio_a_meio = item.get('eh_meio_a_meio', False)
                tamanho = item.get('tamanho', '')
                
                if eh_meio_a_meio:
                    metade2_nome = item.get('esfiha_metade2_nome', 'Outro sabor')
                    tamanho_str = f" ({tamanho.upper()})" if tamanho else ""
                    nome_completo = f"Pizza MEIO A MEIO{tamanho_str}<br/>&nbsp;&nbsp;• {nome}<br/>&nbsp;&nbsp;• {metade2_nome}"
                else:
                    tamanho_str = f" ({tamanho.upper()})" if tamanho else ""
                    nome_completo = f"{nome}{tamanho_str}"
                
                # Acréscimos
                acrescimos = item.get('acrescimos', [])
                valor_acrescimos = 0
                
                if acrescimos:
                    nome_completo += "<br/><br/><b>+ Acréscimos:</b>"
                    for acrescimo in acrescimos:
                        nome_acr = acrescimo.get('nome', 'Acréscimo')
                        tipo_acr = acrescimo.get('tipo', '')
                        preco_acr = float(acrescimo.get('preco', 0))
                        valor_acrescimos += preco_acr
                        
                        tipo_label = ""
                        if tipo_acr == 'pizza_metade':
                            tipo_label = " (Metade)"
                        elif tipo_acr == 'pizza_toda':
                            tipo_label = " (Pizza Toda)"
                        elif tipo_acr == 'borda':
                            tipo_label = " (Borda)"
                        
                        nome_completo += f"<br/>&nbsp;&nbsp;• {nome_acr}{tipo_label} - R$ {preco_acr:.2f}"
                
                preco_total_item = preco_base + valor_acrescimos
                subtotal = preco_total_item * qtd
                total += subtotal
                
                items_data.append([
                    str(qtd),
                    Paragraph(nome_completo, styles['Normal']),
                    f"R$ {preco_total_item:.2f}",
                    f"R$ {subtotal:.2f}"
                ])
            
            items_table = Table(items_data, colWidths=[40, 280, 80, 80])
            items_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('ALIGN', (1, 1), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            
            elements.append(items_table)
            elements.append(Spacer(1, 20))
            
            # Totais
            taxa_entrega = float(order_data.get('taxa_entrega', 0))
            
            totals_data = [
                ['Subtotal:', f"R$ {total:.2f}"],
            ]
            
            if taxa_entrega > 0:
                totals_data.append(['Taxa de Entrega:', f"R$ {taxa_entrega:.2f}"])
                total += taxa_entrega
            
            totals_data.append(['TOTAL:', f"R$ {total:.2f}"])
            
            totals_table = Table(totals_data, colWidths=[300, 180])
            totals_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
                ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ]))
            
            elements.append(totals_table)
            elements.append(Spacer(1, 20))
            
            # Informações adicionais
            status = order_data.get('status', 'Pendente')
            elements.append(Paragraph(f"<b>Status:</b> {status.upper()}", styles['Normal']))
            
            tipo_entrega = order_data.get('tipo_entrega', 'retirada')
            if tipo_entrega in ['delivery', 'entrega']:
                elements.append(Paragraph("<b>Tipo:</b> DELIVERY", styles['Normal']))
                if order_data.get('endereco_entrega'):
                    elements.append(Paragraph(f"<b>Endereço:</b> {order_data['endereco_entrega']}", styles['Normal']))
            else:
                elements.append(Paragraph("<b>Tipo:</b> RETIRADA", styles['Normal']))
            
            forma_pagamento = order_data.get('forma_pagamento', 'dinheiro')
            forma_map = {
                'dinheiro': 'Dinheiro',
                'cartao_credito': 'Cartão de Crédito',
                'cartao_debito': 'Cartão de Débito',
                'pix': 'PIX'
            }
            elements.append(Paragraph(f"<b>Pagamento:</b> {forma_map.get(forma_pagamento, forma_pagamento)}", styles['Normal']))
            
            if order_data.get('observacoes'):
                elements.append(Spacer(1, 10))
                elements.append(Paragraph(f"<b>Observações:</b> {order_data['observacoes']}", styles['Normal']))
            
            # Gerar PDF
            doc.build(elements)
            return True
            
        except Exception as e:
            print(f"Erro ao criar PDF: {e}")
            return False


class PrinterService:
    """Serviço principal de impressão"""
    
    def __init__(self):
        self.thermal_printer = ThermalPrinter()
        self.pdf_printer = PDFPrinter()
    
    def print_order(self, order_data: Dict, print_type: str = "thermal") -> Dict:
        """
        Imprime pedido
        
        Args:
            order_data: Dados do pedido
            print_type: Tipo de impressão ("thermal", "pdf", "both")
        
        Returns:
            Dict com resultado da impressão
        """
        result = {
            "success": False,
            "thermal_success": False,
            "pdf_success": False,
            "pdf_path": None,
            "message": ""
        }
        
        if print_type in ["thermal", "both"]:
            thermal_success = self.thermal_printer.print_order(order_data)
            result["thermal_success"] = thermal_success
            
            if not thermal_success:
                result["message"] += "Erro na impressão térmica. "
        
        if print_type in ["pdf", "both"]:
            # Cria PDF
            pdf_filename = f"pedido_{order_data.get('id', 'temp')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            pdf_path = os.path.join("uploads", "pdfs", pdf_filename)
            
            # Garante que o diretório existe
            os.makedirs("uploads/pdfs", exist_ok=True)
            
            pdf_success = self.pdf_printer.create_order_pdf(order_data, pdf_path)
            result["pdf_success"] = pdf_success
            
            if pdf_success:
                result["pdf_path"] = pdf_path
            else:
                result["message"] += "Erro ao gerar PDF. "
        
        # Determina sucesso geral
        if print_type == "thermal":
            result["success"] = result["thermal_success"]
        elif print_type == "pdf":
            result["success"] = result["pdf_success"]
        else:  # both
            result["success"] = result["thermal_success"] or result["pdf_success"]
        
        if result["success"]:
            result["message"] = "Impressão realizada com sucesso!"
        elif not result["message"]:
            result["message"] = "Erro desconhecido na impressão."
        
        return result
    
    def get_available_printers(self) -> List[str]:
        """Retorna lista de impressoras disponíveis"""
        printers = []
        system = platform.system()
        
        try:
            if system == "Windows":
                result = subprocess.run(
                    ['wmic', 'printer', 'get', 'name'], 
                    capture_output=True, text=True
                )
                printer_lines = result.stdout.split('\n')[1:]
                for line in printer_lines:
                    printer = line.strip()
                    if printer and printer != 'Name':
                        printers.append(printer)
                        
            elif system == "Linux":
                result = subprocess.run(['lpstat', '-p'], capture_output=True, text=True)
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'printer' in line:
                        parts = line.split()
                        if len(parts) > 1:
                            printers.append(parts[1])
                            
        except Exception as e:
            print(f"Erro ao listar impressoras: {e}")
            
        return printers
