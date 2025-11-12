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
    this.width = 40; // Largura da impressora térmica (80mm = 40 caracteres)
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
   * Cria linha separadora
   */
  _line(char = '-') {
    return char.repeat(this.width) + '\n';
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
    return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
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
   * Gera comandos ESC/POS para impressão de comanda
   */
  generateESCPOSCommands(orderData) {
    const ESC = '\x1B';
    const GS = '\x1D';
    const commands = [];

    // Inicializar impressora
    commands.push(ESC + '@');

    // ========================================
    // CABEÇALHO
    // ========================================
    commands.push(this._line('='));
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push('ESFIHARIA JAMAL\n');
    commands.push('Rua das Esfihas, 123\n');
    commands.push('Tel: (11) 99999-9999\n');
    commands.push(ESC + 'a' + '\x00'); // Alinhar à esquerda
    commands.push(this._line('='));

    // ========================================
    // INFORMAÇÕES DO PEDIDO
    // ========================================
    const pedidoId = orderData.id || 'N/A';
    const data = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    commands.push(`PEDIDO #${pedidoId} | ${data}\n`);
    commands.push(`Cliente: ${(orderData.cliente_nome || 'N/A').substring(0, 25)}\n`);
    
    if (orderData.cliente_telefone) {
      commands.push(`Fone: ${orderData.cliente_telefone}\n`);
    }

    // Tipo de entrega
    const tipoEntrega = orderData.tipo_entrega === 'delivery' || orderData.tipo_entrega === 'entrega' 
      ? 'Delivery' 
      : 'Retirada';
    commands.push(`Entrega: ${tipoEntrega}\n`);

    commands.push(this._line('-'));

    // ========================================
    // ITENS
    // ========================================
    commands.push('ITENS\n\n');

    let total = 0;

    if (orderData.itens && orderData.itens.length > 0) {
      orderData.itens.forEach(item => {
        const nome = item.esfiha_nome || 'Item';
        const qtd = item.quantidade || 1;
        const preco = parseFloat(item.preco_unitario || 0);
        const tamanho = item.tamanho ? ` ${this._formatTamanho(item.tamanho)}` : '';
        const categoria = item.categoria || '';
        const eh_meio_a_meio = item.eh_meio_a_meio || false;
        const acrescimos = item.acrescimos || [];
        
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
          commands.push(`   \u2022 ${nome.substring(0, 32)}\n`);
          if (item.esfiha_metade2_nome) {
            commands.push(`   \u2022 ${item.esfiha_metade2_nome.substring(0, 32)}\n`);
          }
        } else {
          // Item normal
          const linhaItem = `${qtd}x ${nome.substring(0, 20)}${tamanho}`;
          const precoStr = this._formatPrice(subtotal);
          commands.push(this._alignRight(linhaItem, precoStr));
          
          // Para esfihas, adicionar tipo (aberta/fechada)
          if (categoria && categoria.toUpperCase().includes('ESFIHA')) {
            const tipoEsfiha = categoria.toUpperCase().includes('SALGADA') || 
                              categoria.toUpperCase().includes('VEGETARIANA') 
                              ? 'Aberta' 
                              : 'Fechada';
            commands.push(`   (${tipoEsfiha})\n`);
          }
        }

        // Contagem de acréscimos para esfihas
        if (acrescimos.length > 0 && categoria && categoria.toUpperCase().includes('ESFIHA') && qtd > 1) {
          const qtdComAcrescimo = acrescimos.reduce((sum, a) => {
            return sum + (a.tipo === 'esfiha' ? (a.quantidade || 1) : 0);
          }, 0);
          
          if (qtdComAcrescimo > 0 && qtdComAcrescimo < qtd) {
            const qtdSemAcrescimo = qtd - qtdComAcrescimo;
            commands.push(`   [${qtdComAcrescimo} c/ acrescimo, ${qtdSemAcrescimo} normal]\n`);
          } else if (qtdComAcrescimo >= qtd) {
            commands.push(`   [Todas c/ acrescimo]\n`);
          }
        }

        // Acréscimos
        if (acrescimos.length > 0) {
          acrescimos.forEach(acr => {
            let nomeAcr = acr.nome || 'Acrescimo';
            const tipoAcr = acr.tipo || '';
            const precoAcr = parseFloat(acr.preco || 0);
            const qtdAcr = acr.quantidade || 1;
            
            // Formatação específica por tipo
            let tipoLabel = '';
            let prefixo = '';
            let qtdLabel = '';
            
            if (tipoAcr === 'pizza_metade') {
              tipoLabel = ' (metade)';
            } else if (tipoAcr === 'pizza_toda') {
              tipoLabel = ' (toda)';
            } else if (tipoAcr === 'borda') {
              if (!nomeAcr.includes('Borda')) {
                prefixo = 'Borda ';
              } else {
                nomeAcr = nomeAcr.replace('Borda de ', '');
              }
            } else if (tipoAcr === 'esfiha' && qtdAcr > 1) {
              qtdLabel = ` (${qtdAcr}x)`;
            } else if (qtd > 1 && tipoAcr !== 'borda' && tipoAcr !== 'esfiha') {
              qtdLabel = ' (cada)';
            }
            
            const precoAcrStr = this._formatPrice(precoAcr);
            const linhaAcr = `   + ${prefixo}${nomeAcr.substring(0, 20)}${tipoLabel}${qtdLabel}`;
            commands.push(this._alignRight(linhaAcr, precoAcrStr));
          });
        }

        commands.push('\n');
      });
    }

    // ========================================
    // TOTAIS
    // ========================================
    commands.push(this._line('-'));
    
    const subtotalStr = this._formatPrice(total);
    commands.push(this._alignRight('Subtotal:', subtotalStr));
    
    const taxaEntrega = parseFloat(orderData.taxa_entrega || 0);
    const taxaEntregaStr = this._formatPrice(taxaEntrega);
    commands.push(this._alignRight('Entrega:', taxaEntregaStr));
    
    if (taxaEntrega > 0) {
      total += taxaEntrega;
    }

    commands.push(this._line('-'));
    
    const totalStr = this._formatPrice(total);
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push(this._alignRight('TOTAL:', totalStr));
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF
    
    commands.push(this._line('-'));

    // ========================================
    // PAGAMENTO
    // ========================================
    const formaPagamento = this._formatFormaPagamento(orderData.forma_pagamento);
    commands.push(`Pagamento: ${formaPagamento}\n`);

    if (orderData.troco_para && orderData.forma_pagamento === 'dinheiro') {
      const trocoPara = parseFloat(orderData.troco_para);
      const trocoPara Str = this._formatPrice(trocoPara);
      commands.push(`Troco para: ${trocoParaStr}\n`);
      
      const troco = trocoPara - total;
      if (troco > 0) {
        const trocoStr = this._formatPrice(troco);
        commands.push(`Troco: ${trocoStr}\n`);
      }
    }

    // ========================================
    // OBSERVAÇÕES
    // ========================================
    if (orderData.observacoes && orderData.observacoes.trim()) {
      commands.push('\nObservacoes:\n');
      const obs = orderData.observacoes.trim();
      
      // Quebrar observações em linhas se for muito longo
      if (obs.length > this.width) {
        const palavras = obs.split(' ');
        let linha = '';
        
        palavras.forEach(palavra => {
          if ((linha + palavra).length > this.width) {
            commands.push(linha.trim() + '\n');
            linha = palavra + ' ';
          } else {
            linha += palavra + ' ';
          }
        });
        
        if (linha.trim()) {
          commands.push(linha.trim() + '\n');
        }
      } else {
        commands.push(obs + '\n');
      }
    }

    // ========================================
    // ENDEREÇO (se delivery)
    // ========================================
    if (tipoEntrega === 'Delivery') {
      commands.push('\nEndereco:\n');
      
      if (orderData.endereco_entrega) {
        const endereco = orderData.endereco_entrega;
        if (endereco.length > this.width) {
          commands.push(endereco.substring(0, this.width) + '\n');
          if (endereco.length > this.width) {
            commands.push(endereco.substring(this.width, this.width * 2) + '\n');
          }
        } else {
          commands.push(endereco + '\n');
        }
      }
      
      if (orderData.complemento) {
        commands.push(orderData.complemento.substring(0, this.width) + '\n');
      }
      
      if (orderData.cep_entrega) {
        commands.push(`CEP: ${orderData.cep_entrega}\n`);
      }
      
      if (orderData.distancia) {
        commands.push(`Distancia: ${orderData.distancia} km\n`);
      }
    }

    // ========================================
    // RODAPÉ
    // ========================================
    commands.push(this._line('='));
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push('Obrigado pela preferencia!\n');
    commands.push('Volte sempre! \n'); // Emoji removido para compatibilidade
    commands.push(ESC + 'a' + '\x00'); // Alinhar à esquerda
    commands.push(this._line('='));
    commands.push('\n\n\n');

    // Cortar papel (se suportado)
    commands.push(GS + 'V' + '\x00'); // Corte total

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
