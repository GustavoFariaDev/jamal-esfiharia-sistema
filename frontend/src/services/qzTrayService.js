/**
 * Serviço de Impressão Térmica com QZ Tray
 * 
 * Este serviço permite impressão direta em impressoras térmicas
 * (como Bematech MP4200TH) via QZ Tray instalado localmente.
 * 
 * Formato baseado no PDF gerado pelo backend.
 * 
 * ATUALIZAÇÃO: Assinatura criptográfica integrada diretamente no serviço
 */

import qz from 'qz-tray';
import { KJUR, KEYUTIL, stob64, hextorstr } from 'jsrsasign';
import { formatarPreco } from '../utils/formato';

// ============================================================================
// CERTIFICADO DEMO DO QZ TRAY
// ============================================================================

const CERTIFICATE = "-----BEGIN CERTIFICATE-----\n" +
"MIIECzCCAvOgAwIBAgIGAZsi+vUCMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG\n" +
"EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS\n" +
"UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx\n" +
"HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg\n" +
"RGVtbyBDZXJ0MB4XDTI1MTIxNDE3MDcxMFoXDTQ1MTIxNDE3MDcxMFowgaIxCzAJ\n" +
"BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD\n" +
"VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs\n" +
"IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog\n" +
"VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDc\n" +
"6ybJL7VZqGl/nRI416S7RQSIUXObt1ZiQABP0q4Dj2Pjge2qFWbPluvswMzD2L9T\n" +
"ds2ZvzN85McYpnAirdh+hSql3wP5tkiKm9ksNsoF+/1Wmb92J1vVGzuR/nYxMYHA\n" +
"rqbg8yoOrHH5tLtQ1/bgHiuIn/vFDe9/zF0AGGLXhPNWu13xMA3HZFqP1E3yEM8j\n" +
"9lxHPHgBKYU72V8zB10/3xK4z71QqEr8hvp3ThnoQND7IYadv9zNs4hDBK9gRIw5\n" +
"azAwu3Hd0b8dL7hGNKQ0QqQzPdQj2whP0msEu8Ou3xdV7nu7AuWwtQauuor7TqVi\n" +
"aq5coFTKMIiIxo+DxggHAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD\n" +
"VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBS6rhZYtfCNMS7+sm8o6UVOv33wpTANBgkq\n" +
"hkiG9w0BAQsFAAOCAQEANVvG7rqpGP0PmHBd55p9y2Ev6bFsC8s7s690EJtkf1oS\n" +
"A2M/MUyQ37bll3JOOWcEl3bNxmWEAeXAic6hL6IRo0To2IWNqnlmMEY2/ZVMLz7+\n" +
"ZH7d7YwPGfHqMaiRd+xYYcVwjGpiq6i2g2NxKGZGzjLpLV52mwirU4TnMERWPfwq\n" +
"vDp9ekNczTJdnEY+lrDB02bMHIqCBTdzSMeqDuSBR7aRB59OSaJx9BqPwlnupMmF\n" +
"GgCMsMLU/eTTdAFK8kaPGNyD6lr4ZnxVhdDx82+PqGOQpkUEMCXmM9QdR2F3p1VI\n" +
"tBudQa+VL9M+SHsMpF0Wu6zIs2IwXkc5pWa2P1+NmA==\n" +
"-----END CERTIFICATE-----";

const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n" +
"MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDc6ybJL7VZqGl/\n" +
"nRI416S7RQSIUXObt1ZiQABP0q4Dj2Pjge2qFWbPluvswMzD2L9Tds2ZvzN85McY\n" +
"pnAirdh+hSql3wP5tkiKm9ksNsoF+/1Wmb92J1vVGzuR/nYxMYHArqbg8yoOrHH5\n" +
"tLtQ1/bgHiuIn/vFDe9/zF0AGGLXhPNWu13xMA3HZFqP1E3yEM8j9lxHPHgBKYU7\n" +
"2V8zB10/3xK4z71QqEr8hvp3ThnoQND7IYadv9zNs4hDBK9gRIw5azAwu3Hd0b8d\n" +
"L7hGNKQ0QqQzPdQj2whP0msEu8Ou3xdV7nu7AuWwtQauuor7TqViaq5coFTKMIiI\n" +
"xo+DxggHAgMBAAECggEAUU3r6tw3koU0Ooact7XJhzBp8B+F/DeXv7YNR1NivqWt\n" +
"ngPp65BP07OYJXx5f9SL6ZROK7jeIqdyDMTofSLdDAdHgF9Y77Sh8v1Tin2pkVVB\n" +
"0fboq3vlxMLuhBcR+Z3eQoMkoKJthpP5qGxXCfRJhAcmf3RdrRKpY6/bRFc1PVqe\n" +
"QqM90WPvqY/B4X8Dns6wJu33n1MXQzUgFhAJDI7xO1nLDNl/tndTOUIiqFtSVQSU\n" +
"3CzYnVu7Lotelet36XoujJj8rhnLvdfTwycAHbVqGSeR9xN61CibXABCfWoKxPzI\n" +
"wKuovsxjZCvsGCjPj4otjWs6iTQ0XFUFFwC6bBO4YQKBgQDwu7V76F8EEEffllPI\n" +
"Et5IuADTbN+0d0UUYjcpIjnKqLPUJoJ0DNqhIoOziLC8lqWmH1xFg68S1JSnNX8l\n" +
"JZBGnOXhopX9CASZMyr9RYNFVebN0gc5U1eho0iOezb0K8gMqoVPqMm0bmpbS5tW\n" +
"bkttB3ZReUjUdJq3E3ibMk8I5wKBgQDq7cCbZehce1s2xdh/6KaoF8IoaEx3IyAP\n" +
"ko6RsvSqYNYmMKYg5UQEIx3x9/MktjBbRqegyIFdLxHzOdVxTEusJgcVmb9aZmSG\n" +
"zXbqmSDRVoAExshnCJTa9TRrmrPE/PfJZ9rUxIYGGj9qf63r8Xr/AKN5tI20lJhu\n" +
"FgrHwheD4QKBgElQcWHuD9nV932hc5yQGoA9AYtiMfLtC+28R55QXRdaL4IhxEMB\n" +
"kyfVshRgQar9mi8wh9Jn2065zRfrU/CFMx4+NEh2UoWABp59lc8Sd3sLQUJXf3m2\n" +
"5w5EAxnZbpAIMWGiIP10oxE/O0bYjNNSvcfTqPYBIOwLIv80f9uMA8PrAoGAB+lP\n" +
"xivtYkfpL3QEMXKFQj3ilPfGM3DkYIHf+TockSxHqeuTfKIb40PHe2GNN5xHDpvX\n" +
"g0udR6URJq646GLYXYi+TlTqI8I0+nEq4wWbHFGcaAzFrOqWELWXOVRxX13hfk/Y\n" +
"B7hChywVHKIGGl78dF/yIWQaLY2fgH2PiWCY6CECgYASw3HDPyliZcyO0qSQeOoW\n" +
"pmoGtisweCzk3R7LRqH7Ks5Ryte8iQjjwBSbsqcgZ8nRKNA2enYl/7PKOcIoDmol\n" +
"E2gRf/DtZy5T4DO3pwt1Pu8b3h61j68WQOlCuElN8+5zMC2PNtE+4RNySBguMR3R\n" +
"7BTtXSZfl22EmLDwsZAUrg==\n" +
"-----END PRIVATE KEY-----";

class QZTrayService {
  constructor() {
    this.connected = false;
    this.printerName = null;
    this.width = 75; // Largura para impressora térmica 80mm
    this.securityConfigured = false;
  }

  /**
   * Configura a segurança do QZ Tray usando certificado demo
   */
  configureSecurity() {
    if (this.securityConfigured) {
      return;
    }

    try {
      qz.security.setCertificatePromise(function(resolve, reject) {
        resolve(CERTIFICATE);
      });

      qz.security.setSignatureAlgorithm("SHA512");

      qz.security.setSignaturePromise(function(toSign) {
        return function(resolve, reject) {
          try {
            var pk = KEYUTIL.getKey(PRIVATE_KEY);
            var sig = new KJUR.crypto.Signature({"alg": "SHA512withRSA"});
            sig.init(pk);
            sig.updateString(toSign);
            var hex = sig.sign();
            resolve(stob64(hextorstr(hex)));
          } catch (err) {
            console.error("Erro ao assinar:", err);
            reject(err);
          }
        };
      });

      console.log('🔐 Segurança do QZ Tray configurada com sucesso');
      this.securityConfigured = true;
    } catch (error) {
      console.error('Erro ao configurar segurança:', error);
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
        errorMessage += 'O QZ Tray não está rodando.\n\n';
        errorMessage += 'Soluções:\n';
        errorMessage += '1. Verifique se o QZ Tray está instalado\n';
        errorMessage += '2. Procure o ícone verde na bandeja do sistema\n';
        errorMessage += '3. Se não estiver rodando, abra o QZ Tray\n';
        errorMessage += '4. Baixe em: https://qz.io/download/';
      } else if (error.message && (error.message.includes('certificate') || error.message.includes('certificado'))) {
        errorMessage += 'Problema com certificado de segurança.\n\n';
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
    return `${formatarPreco(parseFloat(value))}`;
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
      
      return true;
    } catch (error) {
      console.error('❌ Erro na impressão:', error);
      throw error;
    }
  }
}

export default new QZTrayService();
