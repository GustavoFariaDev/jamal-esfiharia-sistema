/**
 * Serviço de Impressão Térmica com QZ Tray
 * 
 * Este serviço permite impressão direta em impressoras térmicas
 * (como Bematech MP4200TH) via QZ Tray instalado localmente.
 * 
 * Formato baseado no PDF gerado pelo backend.
 * 
 * ATUALIZAÇÃO: Usando certificado demo do QZ Tray (sem assinatura)
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
   * Configura a segurança do QZ Tray usando certificado demo
   * 
   * A configuração de segurança agora está no arquivo sign-message.js
   * que é carregado no index.html antes do React
   */
  configureSecurity() {
    if (this.securityConfigured) {
      return;
    }

    // A configuração já foi feita pelo sign-message.js
    console.log('🔐 Segurança do QZ Tray configurada via sign-message.js');
    this.securityConfigured = true;
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
      
      // Conectar via WebSocket
      await qz.websocket.connect();
      this.connected = true;
      
      console.log('✅ QZ Tray conectado com sucesso!');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar ao QZ Tray:', error);
      
      // Mensagem de erro detalhada com soluções
      let errorMessage = 'Não foi possível conectar ao QZ Tray.\n\n';
      
      if (error.message && error.message.includes('Unable to establish connection')) {
        errorMessage += '🔴 O QZ Tray não está rodando.\n\n';
        errorMessage += 'Soluções:\n';
        errorMessage += '1. Verifique se o QZ Tray está instalado\n';
        errorMessage += '2. Procure o ícone verde na bandeja do sistema\n';
        errorMessage += '3. Se não estiver rodando, abra o QZ Tray\n';
        errorMessage += '4. Baixe em: https://qz.io/download/';
      } else if (error.message && (error.message.includes('certificate') || error.message.includes('certificado'))) {
        errorMessage += '🔐 Problema com certificado de segurança.\n\n';
        errorMessage += 'Soluções:\n';
        errorMessage += '1. Abra o QZ Tray Site Manager (botão direito → Advanced → Site Manager)\n';
        errorMessage += '2. Adicione o site à whitelist\n';
        errorMessage += '3. Recarregue a página (Ctrl+F5)';
      } else {
        errorMessage += `Erro técnico: ${error.message}\n\n`;
        errorMessage += 'Entre em contato com o suporte técnico.';
      }
      
      throw new Error(errorMessage);
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
      'térmica',
      'tm-t20',
      'tm-t88',
      'epson'
    ];

    // Palavras-chave para EXCLUIR (impressoras virtuais/PDF)
    const excludeKeywords = [
      'xps',
      'document writer',
      'microsoft',
      'pdf',
      'onenote',
      'fax',
      'send to',
      'adobe'
    ];

    // Procurar impressora térmica
    for (const printer of printers) {
      const printerLower = printer.toLowerCase();
      
      // Verificar se NÃO é impressora virtual
      let isVirtual = false;
      for (const exclude of excludeKeywords) {
        if (printerLower.includes(exclude)) {
          isVirtual = true;
          break;
        }
      }
      
      if (isVirtual) {
        console.log('Ignorando impressora virtual:', printer);
        continue;
      }
      
      // Verificar se é impressora térmica
      for (const keyword of thermalKeywords) {
        if (printerLower.includes(keyword)) {
          this.printerName = printer;
          console.log('✅ Impressora térmica encontrada:', printer);
          return printer;
        }
      }
    }

    // Se não encontrou térmica, usar a primeira impressora física (não virtual)
    for (const printer of printers) {
      const printerLower = printer.toLowerCase();
      
      let isVirtual = false;
      for (const exclude of excludeKeywords) {
        if (printerLower.includes(exclude)) {
          isVirtual = true;
          break;
        }
      }
      
      if (!isVirtual) {
        this.printerName = printer;
        console.log('⚠️ Usando primeira impressora física:', printer);
        return printer;
      }
    }

    throw new Error('Nenhuma impressora térmica encontrada. Verifique se a impressora Bematech está conectada e ligada.');
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
      if (orderData.numero) {
        commands.push(`Num: ${orderData.numero}\n`);
      }
      if (orderData.complemento) {
        commands.push(`Comp: ${orderData.complemento}\n`);
      }
      if (orderData.bairro) {
        commands.push(`Bairro: ${orderData.bairro}\n`);
      }
      if (orderData.cidade) {
        commands.push(`Cidade: ${orderData.cidade}\n`);
      }
    }

    commands.push(this._line());

    // ========================================
    // ITENS DO PEDIDO
    // ========================================
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push('ITENS DO PEDIDO\n');
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF
    commands.push('\n');

    if (orderData.itens && orderData.itens.length > 0) {
      orderData.itens.forEach(item => {
        // Nome do item e quantidade
        const nomeItem = item.nome || item.produto_nome || 'Item sem nome';
        const quantidade = item.quantidade || 1;
        const precoUnitario = item.preco_unitario || item.preco || 0;
        const subtotal = item.subtotal || (quantidade * precoUnitario);
        
        // Formatar linha do item: "2x Esfiha de Carne"
        commands.push(`${quantidade}x ${nomeItem}\n`);
        
        // Detalhes adicionais (tamanho, borda, observação)
        if (item.tamanho) {
          commands.push(`   Tam: ${this._formatTamanho(item.tamanho)}\n`);
        }
        
        if (item.borda && item.borda !== 'sem_borda') {
          commands.push(`   Borda: ${item.borda}\n`);
        }
        
        if (item.observacao) {
          commands.push(`   Obs: ${item.observacao}\n`);
        }
        
        // Preço alinhado à direita
        commands.push(this._alignRight('', this._formatPrice(subtotal)));
        commands.push('\n');
      });
    } else {
      commands.push('Nenhum item encontrado no pedido.\n');
    }

    commands.push(this._line());

    // ========================================
    // TOTAIS
    // ========================================
    const subtotal = orderData.subtotal || 0;
    const taxaEntrega = orderData.taxa_entrega || 0;
    const desconto = orderData.desconto || 0;
    const total = orderData.total || (subtotal + taxaEntrega - desconto);

    commands.push(this._alignRight('Subtotal:', this._formatPrice(subtotal)));
    
    if (taxaEntrega > 0) {
      commands.push(this._alignRight('Taxa de Entrega:', this._formatPrice(taxaEntrega)));
    }
    
    if (desconto > 0) {
      commands.push(this._alignRight('Desconto:', `-${this._formatPrice(desconto)}`));
    }
    
    commands.push('\n');
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push(ESC + 'a' + '\x02'); // Alinhar à direita
    commands.push(`TOTAL: ${this._formatPrice(total)}\n`);
    commands.push(ESC + 'a' + '\x00'); // Alinhar à esquerda
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF
    
    commands.push(this._line());

    // ========================================
    // PAGAMENTO E OBSERVAÇÕES
    // ========================================
    const formaPagamento = orderData.forma_pagamento || orderData.metodo_pagamento;
    commands.push(`Pagamento: ${this._formatFormaPagamento(formaPagamento)}\n`);
    
    if (formaPagamento === 'dinheiro' && orderData.troco_para) {
      const troco = parseFloat(orderData.troco_para) - parseFloat(total);
      if (troco > 0) {
        commands.push(`Troco para: ${this._formatPrice(orderData.troco_para)}\n`);
        commands.push(`Troco: ${this._formatPrice(troco)}\n`);
      }
    }

    if (orderData.observacao) {
      commands.push('\n');
      commands.push(ESC + 'E' + '\x01'); // Negrito ON
      commands.push('OBSERVAÇÕES GERAIS:\n');
      commands.push(ESC + 'E' + '\x00'); // Negrito OFF
      commands.push(`${orderData.observacao}\n`);
    }

    // ========================================
    // RODAPÉ
    // ========================================
    commands.push('\n\n');
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push('Obrigado pela preferência!\n');
    commands.push('www.esfihariajamal.com.br\n');
    commands.push('\n\n\n');
    
    // Corte de papel
    commands.push(GS + 'V' + '\x41' + '\x00'); // Corte total

    return commands;
  }

  /**
   * Imprime o pedido
   */
  async printOrder(orderData) {
    try {
      // 1. Conectar e encontrar impressora
      if (!this.printerName) {
        await this.findThermalPrinter();
      } else {
        await this.connect();
      }

      if (!this.printerName) {
        throw new Error('Nenhuma impressora selecionada');
      }

      // 2. Gerar comandos ESC/POS
      const commands = this.generateESCPOSCommands(orderData);

      // 3. Configurar dados para envio
      const config = qz.configs.create(this.printerName);
      
      // 4. Enviar para impressora
      console.log(`🖨️ Enviando para impressora: ${this.printerName}`);
      await qz.print(config, commands);
      
      console.log('✅ Impressão enviada com sucesso!');
      
      // REMOVIDO: alert('Comanda impressa com sucesso!');
      
      return true;
    } catch (error) {
      console.error('❌ Erro na impressão:', error);
      throw error;
    }
  }
}

export default new QZTrayService();
