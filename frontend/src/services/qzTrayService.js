/**
 * Serviço de Impressão Térmica com QZ Tray
 * 
 * Este serviço permite impressão direta em impressoras térmicas
 * (como Bematech MP4200TH) via QZ Tray instalado localmente.
 */

import qz from 'qz-tray';

class QZTrayService {
  constructor() {
    this.connected = false;
    this.printerName = null;
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
   * Gera comandos ESC/POS para impressão de comanda
   */
  generateESCPOSCommands(orderData) {
    const ESC = '\x1B';
    const GS = '\x1D';
    const commands = [];

    // Inicializar impressora
    commands.push(ESC + '@');

    // Centralizar e negrito
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push('ESFIHARIA JAMAL\n');
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF
    
    // Linha separadora
    commands.push('================================\n');

    // Alinhar à esquerda
    commands.push(ESC + 'a' + '\x00');

    // Informações do pedido
    const pedidoId = orderData.id || 'N/A';
    const data = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    commands.push(`PEDIDO #${pedidoId} | ${data}\n`);
    commands.push(`Cliente: ${orderData.cliente_nome || 'N/A'}\n`);
    
    if (orderData.cliente_telefone) {
      commands.push(`Fone: ${orderData.cliente_telefone}\n`);
    }

    // Tipo de entrega
    const tipoEntrega = orderData.tipo_entrega === 'delivery' || orderData.tipo_entrega === 'entrega' 
      ? 'Delivery' 
      : 'Retirada';
    commands.push(`Entrega: ${tipoEntrega}\n`);

    // Endereço (se delivery)
    if (tipoEntrega === 'Delivery') {
      if (orderData.cep_entrega) {
        commands.push(`CEP: ${orderData.cep_entrega}\n`);
      }
      if (orderData.endereco_entrega) {
        commands.push(`End: ${orderData.endereco_entrega}\n`);
      }
      if (orderData.complemento) {
        commands.push(`Compl: ${orderData.complemento}\n`);
      }
    }

    // Observações
    if (orderData.observacoes) {
      commands.push(`OBS: ${orderData.observacoes}\n`);
    }

    commands.push('--------------------------------\n');

    // Itens
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push('ITENS\n');
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF

    let total = 0;

    if (orderData.itens && orderData.itens.length > 0) {
      orderData.itens.forEach(item => {
        const nome = item.esfiha_nome || 'Item';
        const qtd = item.quantidade || 1;
        const preco = parseFloat(item.preco_unitario || 0);
        const tamanho = item.tamanho ? ` ${this.formatTamanho(item.tamanho)}` : '';
        
        // Calcular subtotal
        const acrescimos = item.acrescimos || [];
        const valorAcrescimos = acrescimos.reduce((sum, a) => sum + parseFloat(a.preco || 0), 0);
        const subtotal = (preco + valorAcrescimos) * qtd;
        total += subtotal;

        // Item principal
        if (item.eh_meio_a_meio) {
          commands.push(`${qtd}x Pizza Meio a Meio${tamanho}\n`);
          commands.push(`   • ${nome}\n`);
          if (item.esfiha_metade2_nome) {
            commands.push(`   • ${item.esfiha_metade2_nome}\n`);
          }
        } else {
          commands.push(`${qtd}x ${nome}${tamanho}\n`);
        }

        // Acréscimos
        if (acrescimos.length > 0) {
          acrescimos.forEach(acr => {
            const nomeAcr = acr.nome || 'Acréscimo';
            const precoAcr = parseFloat(acr.preco || 0);
            commands.push(`   + ${nomeAcr} R$ ${precoAcr.toFixed(2).replace('.', ',')}\n`);
          });
        }

        // Subtotal do item
        commands.push(`   Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`);
      });
    }

    commands.push('--------------------------------\n');

    // Totais
    commands.push(`Subtotal: R$ ${total.toFixed(2).replace('.', ',')}\n`);
    
    const taxaEntrega = parseFloat(orderData.taxa_entrega || 0);
    if (taxaEntrega > 0) {
      commands.push(`Entrega: R$ ${taxaEntrega.toFixed(2).replace('.', ',')}\n`);
      total += taxaEntrega;
    }

    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push(`TOTAL: R$ ${total.toFixed(2).replace('.', ',')}\n`);
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF

    commands.push('--------------------------------\n');

    // Forma de pagamento
    const formaPagamento = this.formatFormaPagamento(orderData.forma_pagamento);
    commands.push(`Pagamento: ${formaPagamento}\n`);

    if (orderData.troco_para && orderData.forma_pagamento === 'dinheiro') {
      const trocoPara = parseFloat(orderData.troco_para);
      commands.push(`Troco para: R$ ${trocoPara.toFixed(2).replace('.', ',')}\n`);
      const troco = trocoPara - total;
      if (troco > 0) {
        commands.push(`Troco: R$ ${troco.toFixed(2).replace('.', ',')}\n`);
      }
    }

    // Status
    if (orderData.status) {
      commands.push(`Status: ${orderData.status.toUpperCase()}\n`);
    }

    commands.push('\n');

    // Rodapé
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push('Obrigado pela preferencia!\n');
    commands.push('\n\n\n');

    // Cortar papel (se suportado)
    commands.push(GS + 'V' + '\x00'); // Corte total

    return commands.join('');
  }

  /**
   * Formata tamanho por extenso
   */
  formatTamanho(tamanho) {
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
  formatFormaPagamento(forma) {
    const formas = {
      'dinheiro': 'Dinheiro',
      'cartao_credito': 'Cartão Crédito',
      'cartao_debito': 'Cartão Débito',
      'pix': 'PIX'
    };
    return formas[forma] || forma || 'Não informado';
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
        encoding: 'Cp850', // Encoding para caracteres especiais (acentos)
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
