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
    this.securityConfigured = false;
  }

  /**
   * Configura a segurança do QZ Tray (certificado autoassinado)
   */
  configureSecurity() {
    if (this.securityConfigured) {
      return;
    }

    // Para desenvolvimento local, usar certificado autoassinado
    // O QZ Tray permite isso sem assinatura digital
    qz.security.setCertificatePromise(function(resolve, reject) {
      // Certificado autoassinado (permite impressão local sem backend)
      resolve();
    });

    // Definir algoritmo de assinatura (necessário desde QZ Tray 2.1)
    qz.security.setSignatureAlgorithm("SHA512");
    
    qz.security.setSignaturePromise(function(toSign) {
      return function(resolve, reject) {
        // Assinatura vazia para certificado autoassinado
        resolve();
      };
    });

    this.securityConfigured = true;
    console.log('Segurança do QZ Tray configurada (modo local)');
  }

  /**
   * Conecta ao QZ Tray local
   */
  async connect() {
    if (this.connected) {
      return true;
    }

    try {
      // Configurar segurança antes de conectar
      this.configureSecurity();
      
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
    
    // Log detalhado para debug
    console.log('=== GERANDO COMANDOS ESC/POS ===');
    console.log('orderData completo:', JSON.stringify(orderData, null, 2));
    console.log('Itens encontrados:', orderData.itens ? orderData.itens.length : 0);
    if (orderData.itens && orderData.itens.length > 0) {
      console.log('Primeiro item:', orderData.itens[0]);
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
    const nomeCliente = orderData.nome_cliente || orderData.cliente_nome || 'N/A';
    commands.push(`Cliente: ${nomeCliente}\n`);
    
    const telefone = orderData.telefone || orderData.cliente_telefone;
    if (telefone) {
      // Telefone sem formatação de parênteses
      const fone = telefone.replace(/[()]/g, '');
      commands.push(`Fone: ${fone}\n`);
    }

    // Tipo de entrega
    const formaEntrega = orderData.forma_entrega || orderData.tipo_entrega;
    const tipoEntrega = formaEntrega === 'delivery' || formaEntrega === 'entrega' 
      ? 'Delivery' 
      : 'Retirada';
    commands.push(`Entrega: ${tipoEntrega}\n`);

    // Informações de delivery
    if (tipoEntrega === 'Delivery') {
      if (orderData.cep_entrega) {
        commands.push(`CEP: ${orderData.cep_entrega}\n`);
      }
      if (orderData.endereco) {
        // Quebrar endereço em linhas se for muito longo (largura = 75)
        const maxLen = 65; // Deixar espaço para "End: "
        const endereco = orderData.endereco;
        if (endereco.length > maxLen) {
          commands.push(`End: ${endereco.substring(0, maxLen)}\n`);
          // Segunda linha (se necessário)
          if (endereco.length > maxLen) {
            commands.push(`     ${endereco.substring(maxLen, maxLen * 2)}\n`);
          }
        } else {
          commands.push(`End: ${endereco}\n`);
        }
      }
      if (orderData.complemento) {
        commands.push(`Compl: ${orderData.complemento}\n`);
      }
      if (orderData.distancia_km) {
        commands.push(`Dist: ${parseFloat(orderData.distancia_km).toFixed(1)} km\n`);
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
        
        const nome = item.esfiha || item.esfiha_nome || 'Item';
        const qtd = parseInt(item.quantidade) || 1;
        const preco = parseFloat(item.preco_unitario) || 0;
        const tamanho = item.tamanho ? ` ${this._formatTamanho(item.tamanho)}` : '';
        const eh_meio_a_meio = item.eh_meio_a_meio || false;
        const acrescimos = Array.isArray(item.acrescimos) ? item.acrescimos : [];
        
        // Calcular subtotal
        const valorAcrescimos = acrescimos.reduce((sum, a) => sum + (parseFloat(a.preco_unitario || a.preco || 0) * parseInt(a.quantidade || 1)), 0);
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
          const metade2 = item.esfiha_metade2 || item.esfiha_metade2_nome;
          if (metade2) {
            commands.push(`  \u2022 ${metade2.toUpperCase()}\n`);
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
            const nomeAcr = acr.acrescimo_nome || acr.nome || 'Acrescimo';
            const qtdAcr = parseInt(acr.quantidade || 1);
            const precoAcr = parseFloat(acr.preco_unitario || acr.preco || 0) * qtdAcr;
            const precoAcrStr = this._formatPrice(precoAcr);
            const qtdLabel = qtdAcr > 1 ? ` (${qtdAcr}x)` : '';
            commands.push(this._alignRight(`  + ${nomeAcr}${qtdLabel}`, precoAcrStr));
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
