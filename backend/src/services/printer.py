"""
Módulo de impressão para pedidos da Esfiharia Jamal
Formato compacto e profissional
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
    """Classe para impressão em impressoras térmicas - Formato Compacto"""
    
    def __init__(self, printer_name: Optional[str] = None):
        self.printer_name = printer_name or self._detect_thermal_printer()
        self.width = 40  # Largura compacta
        
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
    
    def _line(self, char: str = "=") -> str:
        """Linha separadora"""
        return char * self.width
    
    def _center(self, text: str) -> str:
        """Centraliza texto"""
        return text.center(self.width)
    
    def _format_price(self, value: float) -> str:
        """Formata preço"""
        return f"{value:.2f}".replace('.', ',')
    
    def _tamanho_extenso(self, tamanho: Optional[str]) -> str:
        """Formata tamanho por extenso"""
        if not tamanho:
            return ""
        
        extenso = {
            'grande': 'Grande',
            'media': 'Média',
            'medio': 'Médio',
            'broto': 'Broto',
            'pequena': 'Pequena'
        }
        
        return f" {extenso.get(tamanho.lower(), tamanho.capitalize())}"
    
    def format_order_receipt(self, order_data: Dict) -> str:
        """Formata recibo compacto"""
        lines = []
        
        # Cabeçalho
        lines.append(self._line("="))
        lines.append(self._center("ESFIHARIA JAMAL"))
        lines.append(self._center("Rua das Esfihas, 123"))
        lines.append(self._center("Tel: (11) 99999-9999"))
        lines.append(self._line("="))
        
        # Info pedido (linha única)
        pedido_id = order_data.get('id', 'N/A')
        data = datetime.now().strftime('%d/%m/%y %H:%M')
        lines.append(f"PEDIDO #{pedido_id} | {data}")
        
        # Cliente
        cliente = order_data.get('cliente_nome', 'N/A')
        lines.append(f"Cliente: {cliente[:25]}")
        
        fone = order_data.get('cliente_telefone', '')
        if fone:
            lines.append(f"Fone: {fone}")
        
        # Tipo entrega
        tipo_entrega = order_data.get('tipo_entrega', 'retirada')
        tipo_label = 'Delivery' if tipo_entrega == 'delivery' else 'Retirada'
        lines.append(f"Entrega: {tipo_label}")
        
        lines.append(self._line("-"))
        
        # Itens
        lines.append("ITENS")
        
        total = 0
        
        for item in order_data.get('itens', []):
            nome = item.get('esfiha_nome', 'Item')
            qtd = item.get('quantidade', 1)
            preco_base = float(item.get('preco_unitario', 0))
            eh_meio_a_meio = item.get('eh_meio_a_meio', False)
            tamanho = item.get('tamanho', '')
            acrescimos = item.get('acrescimos', [])
            categoria = item.get('categoria', '')
            
            # Calcular subtotal do item
            valor_acrescimos = sum(float(a.get('preco', 0)) for a in acrescimos)
            subtotal_item = (preco_base + valor_acrescimos) * qtd
            total += subtotal_item
            
            # Linha principal do item
            tamanho_str = self._tamanho_extenso(tamanho)
            preco_str = self._format_price(subtotal_item)
            
            if eh_meio_a_meio:
                # Pizza meio a meio
                metade2 = item.get('esfiha_metade2_nome', 'Outro')
                linha_item = f"{qtd}x Pizza Meio a Meio{tamanho_str}"
                espacos = self.width - len(linha_item) - len(preco_str)
                lines.append(f"{linha_item}{' ' * espacos}{preco_str}")
                
                # Sabores
                lines.append(f"   • {nome[:32]}")
                lines.append(f"   • {metade2[:32]}")
            else:
                # Item normal
                linha_item = f"{qtd}x {nome[:20]}{tamanho_str}"
                espacos = self.width - len(linha_item) - len(preco_str)
                lines.append(f"{linha_item}{' ' * espacos}{preco_str}")
                
                # Para esfihas, adicionar tipo (aberta/fechada)
                if categoria and 'ESFIHA' in categoria.upper():
                    # Determinar se é aberta ou fechada pela categoria
                    tipo_esfiha = "Aberta" if "SALGADA" in categoria.upper() or "VEGETARIANA" in categoria.upper() else "Fechada"
                    lines.append(f"   ({tipo_esfiha})")
            
            # Acréscimos - com contagem para esfihas
            if acrescimos:
                # Se for esfiha e tiver acréscimos, mostrar contagem
                if categoria and 'ESFIHA' in categoria.upper() and qtd > 1:
                    # Contar quantas esfihas têm acréscimos (soma das quantidades)
                    qtd_com_acrescimo = sum(a.get('quantidade', 1) for a in acrescimos if a.get('tipo') == 'esfiha')
                    if qtd_com_acrescimo > 0 and qtd_com_acrescimo < qtd:
                        qtd_sem_acrescimo = qtd - qtd_com_acrescimo
                        lines.append(f"   [{qtd_com_acrescimo} c/ acréscimo, {qtd_sem_acrescimo} normal]")
                    elif qtd_com_acrescimo >= qtd:
                        lines.append(f"   [Todas c/ acréscimo]")
            
            if acrescimos:
                for acr in acrescimos:
                    nome_acr = acr.get('nome', 'Acréscimo')[:20]
                    tipo_acr = acr.get('tipo', '')
                    preco_acr = float(acr.get('preco', 0))
                    
                    # Tipo abreviado e formatação específica
                    tipo_label = ""
                    prefixo = ""
                    
                    if tipo_acr == 'pizza_metade':
                        tipo_label = " (metade)"
                    elif tipo_acr == 'pizza_toda':
                        tipo_label = " (toda)"
                    elif tipo_acr == 'esfiha':
                        tipo_label = ""
                    elif tipo_acr == 'borda':
                        # Para bordas, manter o prefixo "Borda" mas simplificar
                        if 'Borda' not in nome_acr:
                            prefixo = "Borda "
                        else:
                            # Simplificar se já tem "Borda de"
                            nome_acr = nome_acr.replace('Borda de ', '')
                        tipo_label = ""
                    
                    # Se quantidade > 1, indicar (cada) ou a quantidade específica
                    qtd_acr = acr.get('quantidade', 1)
                    qtd_label = ""
                    if tipo_acr == 'esfiha' and qtd_acr > 1:
                        qtd_label = f" ({qtd_acr}x)"
                    elif qtd > 1 and tipo_acr not in ['borda', 'esfiha']:
                        qtd_label = " (cada)"
                    
                    preco_acr_str = self._format_price(preco_acr)
                    lines.append(f"   + {prefixo}{nome_acr}{tipo_label}{qtd_label} {preco_acr_str}")
            
            lines.append("")
        
        # Totais
        lines.append(self._line("-"))
        
        subtotal_str = self._format_price(total)
        espacos = self.width - len("Subtotal:") - len(subtotal_str)
        lines.append(f"Subtotal:{' ' * espacos}{subtotal_str}")
        
        # Taxa entrega
        taxa_entrega = float(order_data.get('taxa_entrega', 0))
        if taxa_entrega > 0:
            taxa_str = self._format_price(taxa_entrega)
            espacos = self.width - len("Entrega:") - len(taxa_str)
            lines.append(f"Entrega:{' ' * espacos}{taxa_str}")
            total += taxa_entrega
        
        lines.append(self._line("-"))
        
        # Total
        total_str = self._format_price(total)
        espacos = self.width - len("TOTAL:") - len(total_str)
        lines.append(f"TOTAL:{' ' * espacos}{total_str}")
        
        lines.append(self._line("-"))
        
        # Pagamento
        forma_pagamento = order_data.get('forma_pagamento', 'dinheiro')
        forma_map = {
            'dinheiro': 'Dinheiro',
            'cartao_credito': 'Cartão Crédito',
            'cartao_debito': 'Cartão Débito',
            'pix': 'PIX'
        }
        lines.append(f"Pagamento: {forma_map.get(forma_pagamento, forma_pagamento)}")
        
        # Troco
        troco_para = order_data.get('troco_para')
        if troco_para and forma_pagamento == 'dinheiro':
            troco_str = self._format_price(float(troco_para))
            lines.append(f"Troco para: {troco_str}")
        
        # Status
        status = order_data.get('status', 'Pendente')
        lines.append(f"Status: {status.upper()}")
        
        lines.append(self._line("-"))
        
        # Endereço (se delivery)
        if tipo_entrega == 'delivery' and order_data.get('endereco_entrega'):
            endereco = order_data['endereco_entrega']
            lines.append(f"End: {endereco[:35]}")
            
            # Segunda linha do endereço se necessário
            if len(endereco) > 35:
                lines.append(endereco[35:70])
            
            # Distância
            distancia = order_data.get('distancia_km')
            if distancia:
                lines.append(f"{distancia:.1f} km")
        
        # Observações
        obs = order_data.get('observacoes', '').strip()
        if obs:
            lines.append(f"Obs: {obs[:35]}")
            # Quebrar observações longas
            obs_resto = obs[35:]
            while obs_resto:
                lines.append(obs_resto[:self.width])
                obs_resto = obs_resto[self.width:]
        
        if tipo_entrega == 'delivery' or obs:
            lines.append(self._line("-"))
        
        # Rodapé
        lines.append(self._center("Obrigado pela preferência!"))
        lines.append("")
        lines.append("")
        
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
    """Classe para impressão em PDF - Formato Compacto"""
    
    def create_order_pdf(self, order_data: Dict, output_path: str) -> bool:
        """Cria PDF do pedido em formato compacto"""
        try:
            doc = SimpleDocTemplate(output_path, pagesize=A4, 
                                   topMargin=15*mm, bottomMargin=15*mm,
                                   leftMargin=15*mm, rightMargin=15*mm)
            elements = []
            styles = getSampleStyleSheet()
            
            # Estilo título
            title_style = ParagraphStyle(
                'Title',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#2c3e50'),
                spaceAfter=10,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            )
            
            # Estilo normal compacto
            compact_style = ParagraphStyle(
                'Compact',
                parent=styles['Normal'],
                fontSize=9,
                leading=11,
                fontName='Helvetica'
            )
            
            # Cabeçalho
            elements.append(Paragraph("ESFIHARIA JAMAL", title_style))
            elements.append(Paragraph("Rua das Esfihas, 123 - Tel: (11) 99999-9999", compact_style))
            elements.append(Spacer(1, 10))
            
            # Info pedido
            pedido_id = order_data.get('id', 'N/A')
            data = datetime.now().strftime('%d/%m/%Y %H:%M')
            cliente = order_data.get('cliente_nome', 'N/A')
            fone = order_data.get('cliente_telefone', '')
            tipo_entrega = 'Delivery' if order_data.get('tipo_entrega') == 'delivery' else 'Retirada'
            
            info_text = f"<b>PEDIDO #{pedido_id}</b> | {data}<br/>"
            info_text += f"Cliente: {cliente}<br/>"
            if fone:
                info_text += f"Fone: {fone}<br/>"
            info_text += f"Entrega: {tipo_entrega}"
            
            elements.append(Paragraph(info_text, compact_style))
            elements.append(Spacer(1, 10))
            
            # Itens
            items_data = []
            total = 0
            
            for item in order_data.get('itens', []):
                nome = item.get('esfiha_nome', 'Item')
                qtd = item.get('quantidade', 1)
                preco_base = float(item.get('preco_unitario', 0))
                eh_meio_a_meio = item.get('eh_meio_a_meio', False)
                tamanho = item.get('tamanho', '')
                acrescimos = item.get('acrescimos', [])
                
                # Tamanho por extenso
                tamanho_str = ""
                if tamanho:
                    extenso = {'grande': 'Grande', 'media': 'Média', 'medio': 'Médio', 'broto': 'Broto', 'pequena': 'Pequena'}
                    tamanho_str = f" {extenso.get(tamanho.lower(), tamanho.capitalize())}"
                
                # Calcular subtotal
                valor_acrescimos = sum(float(a.get('preco', 0)) for a in acrescimos)
                subtotal_item = (preco_base + valor_acrescimos) * qtd
                total += subtotal_item
                
                # Montar descrição
                if eh_meio_a_meio:
                    metade2 = item.get('esfiha_metade2_nome', 'Outro')
                    desc = f"<b>{qtd}x Pizza Meio a Meio{tamanho_str}</b><br/>"
                    desc += f"&nbsp;&nbsp;• {nome}<br/>"
                    desc += f"&nbsp;&nbsp;• {metade2}"
                else:
                    desc = f"<b>{qtd}x {nome}{tamanho_str}</b>"
                
                # Acréscimos
                if acrescimos:
                    for acr in acrescimos:
                        nome_acr = acr.get('nome', 'Acréscimo')
                        tipo_acr = acr.get('tipo', '')
                        preco_acr = float(acr.get('preco', 0))
                        
                        tipo_label = ""
                        if tipo_acr == 'pizza_metade':
                            tipo_label = " (metade)"
                        elif tipo_acr == 'pizza_toda':
                            tipo_label = " (toda)"
                        elif tipo_acr == 'borda':
                            nome_acr = nome_acr.replace('Borda de ', '').replace('Borda ', '')
                        
                        qtd_label = " (cada)" if qtd > 1 and tipo_acr != 'borda' else ""
                        
                        desc += f"<br/>&nbsp;&nbsp;+ {nome_acr}{tipo_label}{qtd_label} {preco_acr:.2f}"
                
                items_data.append([Paragraph(desc, compact_style), f"R$ {subtotal_item:.2f}"])
            
            # Tabela de itens
            items_table = Table(items_data, colWidths=[140*mm, 40*mm])
            items_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
            ]))
            
            elements.append(items_table)
            elements.append(Spacer(1, 5))
            
            # Totais
            taxa_entrega = float(order_data.get('taxa_entrega', 0))
            
            totals_data = [
                ['Subtotal:', f"R$ {total:.2f}"],
            ]
            
            if taxa_entrega > 0:
                totals_data.append(['Entrega:', f"R$ {taxa_entrega:.2f}"])
                total += taxa_entrega
            
            totals_data.append(['<b>TOTAL:</b>', f"<b>R$ {total:.2f}</b>"])
            
            totals_table = Table(totals_data, colWidths=[140*mm, 40*mm])
            totals_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ]))
            
            elements.append(totals_table)
            elements.append(Spacer(1, 10))
            
            # Informações adicionais
            forma_pagamento = order_data.get('forma_pagamento', 'dinheiro')
            forma_map = {
                'dinheiro': 'Dinheiro',
                'cartao_credito': 'Cartão Crédito',
                'cartao_debito': 'Cartão Débito',
                'pix': 'PIX'
            }
            
            info_adicional = f"<b>Pagamento:</b> {forma_map.get(forma_pagamento, forma_pagamento)}<br/>"
            
            troco_para = order_data.get('troco_para')
            if troco_para and forma_pagamento == 'dinheiro':
                info_adicional += f"<b>Troco para:</b> R$ {float(troco_para):.2f}<br/>"
            
            status = order_data.get('status', 'Pendente')
            info_adicional += f"<b>Status:</b> {status.upper()}"
            
            elements.append(Paragraph(info_adicional, compact_style))
            
            # Endereço delivery
            if order_data.get('tipo_entrega') == 'delivery':
                elements.append(Spacer(1, 5))
                endereco = order_data.get('endereco_entrega', '')
                distancia = order_data.get('distancia_km')
                
                end_text = f"<b>Endereço:</b> {endereco}"
                if distancia:
                    end_text += f" | {distancia:.1f} km"
                
                elements.append(Paragraph(end_text, compact_style))
            
            # Observações
            obs = order_data.get('observacoes', '').strip()
            if obs:
                elements.append(Spacer(1, 5))
                elements.append(Paragraph(f"<b>Obs:</b> {obs}", compact_style))
            
            elements.append(Spacer(1, 15))
            elements.append(Paragraph("<i>Obrigado pela preferência!</i>", 
                                    ParagraphStyle('Footer', parent=compact_style, alignment=TA_CENTER)))
            
            # Gerar PDF
            doc.build(elements)
            return True
            
        except Exception as e:
            print(f"Erro ao criar PDF: {e}")
            import traceback
            traceback.print_exc()
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
