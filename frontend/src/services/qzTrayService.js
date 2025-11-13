/**
 * Serviço de Impressão Térmica com QZ Tray
 * 
 * Este serviço permite impressão direta em impressoras térmicas
 * (como Bematech MP4200TH) via QZ Tray instalado localmente.
 * 
 * Formato baseado no PDF gerado pelo backend.
 */

import qz from 'qz-tray';

class QZTrayService {
  constructor() {
    this.connected = false;
    this.printerName = null;
    this.width = 75; // Largura para impressora térmica 80mm
  }

  /**
   * Conecta ao QZ Tray local
   */
  async connect() {
    if (this.connected) {
      return true;
    }

    try {
      await qz.websocket.connect();
      this.connected = true;
      console.log('QZ Tray conectado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao QZ Tray:', error);
      throw new Error(
        'Não foi possível conectar ao QZ Tray. ' +
        'Certifique-se de que o QZ Tray está instalado e rodando. ' +
        'Baixe em: https://qz.io/download/'
      );
    }
  }

  /**
   * Desconecta do QZ Tray
   */
  async disconnect() {
    if (!this.connected) {
      return;
    }

    try {
      await qz.websocket.disconnect();
      this.connected = false;
      console.log('QZ Tray desconectado');
    } catch (error) {
      console.error('Erro ao desconectar do QZ Tray:', error);
    }
  }

  /**
   * Lista todas as impressoras disponíveis
   */
  async listPrinters() {
    await this.connect();
    
    try {
      const printers = await qz.printers.find();
      console.log('Impressoras encontradas:', printers);
      return printers;
    } catch (error) {
      console.error('Erro ao listar impressoras:', error);
      throw new Error('Erro ao listar impressoras');
    }
  }

  /**
   * Encontra impressora térmica (Bematech ou similar)
   */
  async findThermalPrinter() {
    const printers = await this.listPrinters();
    
    // Palavras-chave para identificar impressoras térmicas
    const thermalKeywords = [
      'bematech',
      'mp-4200',
      'mp4200',
      'thermal',
      'receipt',
      'pos',
      'térmica'
    ];

    // Procurar impressora térmica
    for (const printer of printers) {
      const printerLower = printer.toLowerCase();
      for (const keyword of thermalKeywords) {
        if (printerLower.includes(keyword)) {
          this.printerName = printer;
          console.log('Impressora térmica encontrada:', printer);
          return printer;
        }
      }
    }

    // Se não encontrou, usar a primeira impressora
    if (printers.length > 0) {
      this.printerName = printers[0];
      console.log('Usando primeira impressora:', printers[0]);
      return printers[0];
    }

    throw new Error('Nenhuma impressora encontrada');
  }

  /**
   * Define a impressora a ser usada
   */
  setPrinter(printerName) {
    this.printerName = printerName;
  }

  /**
   * Cria linha separadora com underscores
   */
  _line() {
    return '_'.repeat(this.width) + '\n';
  }

  /**
   * Centraliza texto
   */
  _center(text) {
    const padding = Math.floor((this.width - text.length) / 2);
    return ' '.repeat(Math.max(0, padding)) + text + '\n';
  }

  /**
   * Formata preço
   */
  _formatPrice(value) {
    return `R$ ${parseFloat(value).toFixed(2)}`;
  }

  /**
   * Alinha texto à direita (para preços)
   */
  _alignRight(leftText, rightText) {
    const spaces = this.width - leftText.length - rightText.length;
    return leftText + ' '.repeat(Math.max(1, spaces)) + rightText + '\n';
  }

  /**
   * Formata tamanho por extenso
   */
  _formatTamanho(tamanho) {
    if (!tamanho) return '';
    const extenso = {
      'grande': 'Grande',
      'media': 'Média',
      'medio': 'Médio',
      'broto': 'Broto',
      'pequena': 'Pequena'
    };
    return extenso[tamanho.toLowerCase()] || tamanho;
  }

  /**
   * Formata forma de pagamento
   */
  _formatFormaPagamento(forma) {
    const formas = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'pix': 'PIX'
    };
    return formas[forma] || forma || 'Não informado';
  }

  /**
   * Formata status do pedido
   */
  _formatStatus(status) {
    if (!status) return 'PENDENTE';
    return status.toUpperCase();
  }

  /**
   * Gera comandos ESC/POS para impressão de comanda
   */
  generateESCPOSCommands(orderData) {
    // Validação de dados
    if (!orderData) {
      throw new Error('Dados do pedido não fornecidos');
    }
    
    const ESC = '\x1B';
    const GS = '\x1D';
    const commands = [];

    // Inicializar impressora
    commands.push(ESC + '@');

    // ========================================
    // CABEÇALHO
    // ========================================
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push('ESFIHARIA JAMAL\n');
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF
    commands.push('\n');
    commands.push(ESC + 'a' + '\x00'); // Alinhar à esquerda

    // ========================================
    // INFORMAÇÕES DO PEDIDO
    // ========================================
    const pedidoId = orderData.id || 'N/A';
    const data = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    commands.push(`PEDIDO #${pedidoId} | ${data}\n`);
    commands.push(`Cliente: ${orderData.cliente_nome || 'N/A'}\n`);
    
    if (orderData.cliente_telefone) {
      // Telefone sem formatação de parênteses
      const fone = orderData.cliente_telefone.replace(/[()]/g, '');
      commands.push(`Fone: ${fone}\n`);
    }

    // Tipo de entrega
    const tipoEntrega = orderData.tipo_entrega === 'delivery' || orderData.tipo_entrega === 'entrega' 
      ? 'Delivery' 
      : 'Retirada';
    commands.push(`Entrega: ${tipoEntrega}\n`);

    // Informações de delivery
    if (tipoEntrega === 'Delivery') {
      if (orderData.cep_entrega) {
        commands.push(`CEP: ${orderData.cep_entrega}\n`);
      }
      if (orderData.endereco) {
        commands.push(`Endereco: ${orderData.endereco}\n`);
      }
      if (orderData.complemento) {
        commands.push(`Complemento: ${orderData.complemento}\n`);
      }
    }

    // Observações
    if (orderData.observacoes && orderData.observacoes.trim()) {
      commands.push(`Observacoes: ${orderData.observacoes.trim()}\n`);
    }

    commands.push('\n');

    // ========================================
    // ITENS
    // ========================================
    let total = 0;

    if (orderData.itens && orderData.itens.length > 0) {
      orderData.itens.forEach(item => {
        // Proteção contra dados nulos
        if (!item) return;
        
        const nome = item.esfiha_nome || 'Item';
        const qtd = parseInt(item.quantidade) || 1;
        const preco = parseFloat(item.preco_unitario) || 0;
        const tamanho = item.tamanho ? ` ${this._formatTamanho(item.tamanho)}` : '';
        const eh_meio_a_meio = item.eh_meio_a_meio || false;
        const acrescimos = Array.isArray(item.acrescimos) ? item.acrescimos : [];
        
        // Calcular subtotal
        const valorAcrescimos = acrescimos.reduce((sum, a) => sum + parseFloat(a.preco || 0), 0);
        const subtotal = (preco + valorAcrescimos) * qtd;
        total += subtotal;

        // Linha principal do item
        if (eh_meio_a_meio) {
          // Pizza meio a meio
          const linhaItem = `${qtd}x Pizza Meio a Meio${tamanho}`;
          const precoStr = this._formatPrice(subtotal);
          commands.push(this._alignRight(linhaItem, precoStr));
          
          // Sabores
          commands.push(`  \u2022 ${nome.toUpperCase()}\n`);
          if (item.esfiha_metade2_nome) {
            commands.push(`  \u2022 ${item.esfiha_metade2_nome.toUpperCase()}\n`);
          }
        } else {
          // Item normal
          const linhaItem = `${qtd}x ${nome}${tamanho}`;
          const precoStr = this._formatPrice(subtotal);
          commands.push(this._alignRight(linhaItem, precoStr));
        }

        // Acréscimos
        if (acrescimos.length > 0) {
          acrescimos.forEach(acr => {
            const nomeAcr = acr.nome || 'Acrescimo';
            const precoAcr = parseFloat(acr.preco || 0);
            const precoAcrStr = this._formatPrice(precoAcr);
            commands.push(this._alignRight(`  + ${nomeAcr}`, precoAcrStr));
          });
        }
      });
    }

    commands.push(this._line());

    // ========================================
    // TOTAIS
    // ========================================
    const subtotalStr = this._formatPrice(total);
    commands.push(this._alignRight('Subtotal:', subtotalStr));
    
    const taxaEntrega = parseFloat(orderData.taxa_entrega || 0);
    const taxaEntregaStr = this._formatPrice(taxaEntrega);
    commands.push(this._alignRight('Entrega:', taxaEntregaStr));
    
    if (taxaEntrega > 0) {
      total += taxaEntrega;
    }

    commands.push(this._line());
    
    const totalStr = this._formatPrice(total);
    commands.push('\n');
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push(this._alignRight('TOTAL:', totalStr));
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF
    commands.push('\n');

    // ========================================
    // PAGAMENTO E STATUS
    // ========================================
    const formaPagamento = this._formatFormaPagamento(orderData.forma_pagamento);
    commands.push(`Pagamento: ${formaPagamento}\n`);

    // Troco (se dinheiro)
    if (orderData.troco_para && orderData.forma_pagamento === 'dinheiro') {
      const trocoPara = parseFloat(orderData.troco_para);
      const trocoParaStr = this._formatPrice(trocoPara);
      commands.push(`Troco para: ${trocoParaStr}\n`);
      
      const troco = trocoPara - total;
      if (troco > 0) {
        const trocoStr = this._formatPrice(troco);
        commands.push(`Troco: ${trocoStr}\n`);
      }
    }

    // Status
    const status = this._formatStatus(orderData.status);
    commands.push(`Status: ${status}\n`);

    // Distância (se delivery)
    if (tipoEntrega === 'Delivery' && orderData.distancia_km) {
      const dist = parseFloat(orderData.distancia_km).toFixed(1);
      commands.push(`Distancia: ${dist} km\n`);
    }

    commands.push('\n');

    // ========================================
    // RODAPÉ
    // ========================================
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push('Obrigado pela preferencia!\n');
    commands.push(ESC + 'a' + '\x00'); // Alinhar à esquerda
    commands.push('\n\n\n');

    // Cortar papel (Bematech MP-4200 TH)
    // GS V 48 = Corte total (padrão ESC/POS)
    // GS V 49 = Corte parcial
    commands.push(GS + 'V' + '\x30'); // \x30 = 48 em ASCII = Corte total

    return commands.join('');
  }

  /**
   * Imprime pedido na impressora térmica
   */
  async printOrder(orderData, printerName = null) {
    try {
      // Conectar ao QZ Tray
      await this.connect();

      // Definir impressora
      const printer = printerName || this.printerName || await this.findThermalPrinter();

      // Gerar comandos ESC/POS
      const commands = this.generateESCPOSCommands(orderData);

      // Configurar impressão
      const config = qz.configs.create(printer, {
        encoding: 'UTF-8', // Encoding para caracteres especiais (acentos em português)
        altPrinting: true  // Modo alternativo para melhor compatibilidade
      });

      // Enviar para impressão
      const data = [{
        type: 'raw',
        format: 'command',
        data: commands
      }];

      await qz.print(config, data);

      console.log('Impressão enviada com sucesso!');
      return {
        success: true,
        message: 'Comanda enviada para impressão térmica!'
      };

    } catch (error) {
      console.error('Erro ao imprimir:', error);
      
      // Mensagem de erro amigável
      let errorMessage = 'Erro ao imprimir na impressora térmica.';
      
      if (error.message.includes('QZ Tray')) {
        errorMessage = error.message;
      } else if (error.message.includes('Nenhuma impressora')) {
        errorMessage = 'Nenhuma impressora térmica encontrada. Verifique se a impressora está conectada e ligada.';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }
  }

  /**
   * Verifica se QZ Tray está disponível
   */
  async isAvailable() {
    try {
      await this.connect();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new QZTrayService();
