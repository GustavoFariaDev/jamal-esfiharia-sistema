/**
 * Serviço de Impressão Térmica com QZ Tray
 * 
 * Este serviço permite impressão direta em impressoras térmicas
 * (como Bematech MP4200TH) via QZ Tray instalado localmente.
 * 
 * Formato baseado no PDF gerado pelo backend.
 * 
 * ATUALIZAÇÃO: Configurado para funcionar em HTTPS com assinatura via backend
 */

import qz from 'qz-tray';

// URL base da API (ajusta automaticamente para produção ou desenvolvimento)
const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

class QZTrayService {
  constructor() {
    this.connected = false;
    this.printerName = null;
    this.width = 75; // Largura para impressora térmica 80mm
    this.securityConfigured = false;
  }

  /**
   * Configura a segurança do QZ Tray para HTTPS com assinatura via backend
   * 
   * Esta configuração usa o backend para assinar requisições,
   * eliminando a necessidade de permissão manual do usuário.
   */
  configureSecurity() {
    if (this.securityConfigured) {
      return;
    }

    try {
      console.log('🔐 Configurando segurança do QZ Tray...');
      
      // Configurar certificado - buscar do backend
      qz.security.setCertificatePromise(function(resolve, reject) {
        // Buscar certificado do backend
        fetch(`${API_BASE_URL}/api/qz/certificate`, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erro ao buscar certificado: ${response.status}`);
          }
          return response.text();
        })
        .then(cert => {
          console.log('✅ Certificado carregado do backend');
          resolve(cert);
        })
        .catch(err => {
          console.error('❌ Erro ao carregar certificado:', err);
          reject(err);
        });
      });

      // Configurar assinatura - usar backend para assinar
      qz.security.setSignatureAlgorithm("SHA512");
      
      qz.security.setSignaturePromise(function(toSign) {
        return function(resolve, reject) {
          // Enviar para backend assinar
          fetch(`${API_BASE_URL}/api/qz/sign`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              request: toSign
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Erro ao assinar requisição: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (data.success && data.signature) {
              console.log('✅ Requisição assinada pelo backend');
              resolve(data.signature);
            } else {
              throw new Error(data.error || 'Erro ao assinar requisição');
            }
          })
          .catch(err => {
            console.error('❌ Erro ao assinar requisição:', err);
            reject(err);
          });
        };
      });

      this.securityConfigured = true;
      console.log('✅ Segurança do QZ Tray configurada com backend');
    } catch (error) {
      console.error('❌ Erro ao configurar segurança do QZ Tray:', error);
      throw error;
    }
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
        errorMessage += '1. Verifique se o backend está rodando\n';
        errorMessage += '2. Recarregue a página (Ctrl+F5)\n';
        errorMessage += '3. Limpe o cache do navegador\n';
        errorMessage += '4. Entre em contato com o suporte';
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
          if (item.sabor1) {
            commands.push(`   1) ${item.sabor1}\n`);
          }
          if (item.sabor2) {
            commands.push(`   2) ${item.sabor2}\n`);
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
            const nomeAcr = acr.nome || acr.acrescimo_nome || 'Acréscimo';
            const qtdAcr = parseInt(acr.quantidade) || 1;
            const precoAcr = parseFloat(acr.preco_unitario || acr.preco || 0);
            const subtotalAcr = precoAcr * qtdAcr;
            
            const linhaAcr = `  + ${qtdAcr}x ${nomeAcr}`;
            const precoAcrStr = this._formatPrice(subtotalAcr);
            commands.push(this._alignRight(linhaAcr, precoAcrStr));
          });
        }

        // Observações do item
        if (item.observacoes && item.observacoes.trim()) {
          commands.push(`  Obs: ${item.observacoes.trim()}\n`);
        }

        commands.push('\n');
      });
    } else {
      commands.push('Nenhum item no pedido\n\n');
    }

    // ========================================
    // TOTAIS
    // ========================================
    commands.push(this._line());

    // Subtotal
    const subtotalProdutos = total;
    commands.push(this._alignRight('Subtotal:', this._formatPrice(subtotalProdutos)));

    // Taxa de entrega
    const taxaEntrega = parseFloat(orderData.taxa_entrega || 0);
    if (taxaEntrega > 0) {
      commands.push(this._alignRight('Taxa de Entrega:', this._formatPrice(taxaEntrega)));
      total += taxaEntrega;
    }

    // Total
    commands.push(ESC + 'E' + '\x01'); // Negrito ON
    commands.push(this._alignRight('TOTAL:', this._formatPrice(total)));
    commands.push(ESC + 'E' + '\x00'); // Negrito OFF

    // Forma de pagamento
    const formaPagamento = this._formatFormaPagamento(orderData.forma_pagamento);
    commands.push(`\nPagamento: ${formaPagamento}\n`);

    // Troco (se for dinheiro)
    if (orderData.forma_pagamento === 'dinheiro' && orderData.troco_para) {
      const trocoPara = parseFloat(orderData.troco_para);
      const troco = trocoPara - total;
      commands.push(`Troco para: ${this._formatPrice(trocoPara)}\n`);
      if (troco > 0) {
        commands.push(`Troco: ${this._formatPrice(troco)}\n`);
      }
    }

    // ========================================
    // RODAPÉ
    // ========================================
    commands.push('\n');
    commands.push(this._line());
    commands.push(ESC + 'a' + '\x01'); // Centralizar
    commands.push('Obrigado pela preferencia!\n');
    commands.push('Volte sempre!\n');
    commands.push('\n');
    commands.push('Av. Gago Coutinho, 310\n');
    commands.push('Santa Maria - Santo Andre - SP\n');
    commands.push('Tel: (11) 93333-1106\n');
    commands.push(ESC + 'a' + '\x00'); // Alinhar à esquerda

    // Cortar papel
    commands.push('\n\n\n');
    commands.push(GS + 'V' + '\x41' + '\x03'); // Corte parcial

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
      const escposCommands = this.generateESCPOSCommands(orderData);

      // Configurar impressão
      const config = qz.configs.create(printer, {
        encoding: 'UTF-8', // Encoding para caracteres especiais (acentos em português)
        altPrinting: true  // Modo alternativo para melhor compatibilidade
      });

      // Enviar para impressora
      const data = [{
        type: 'raw',
        format: 'command',
        data: escposCommands
      }];

      await qz.print(config, data);

      console.log('✅ Impressão enviada com sucesso!');
      
      return {
        success: true,
        message: 'Comanda impressa com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro ao imprimir:', error);
      
      // Mensagem de erro amigável
      let errorMessage = 'Erro ao imprimir na impressora térmica.';
      
      if (error.message.includes('QZ Tray')) {
        errorMessage = error.message;
      } else if (error.message.includes('Nenhuma impressora')) {
        errorMessage = 'Nenhuma impressora térmica encontrada. Verifique se a impressora está conectada e ligada.';
      }

      throw new Error(errorMessage);
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
