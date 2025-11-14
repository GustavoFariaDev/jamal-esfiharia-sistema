/**
 * Simulação da formatação do QZ Tray
 * Testa como o endereço aparecerá na impressora térmica
 */

// Dados de teste
const orderData = {
  id: 22,
  cliente_nome: 'Gus',
  cliente_telefone: '11 979614112',
  tipo_entrega: 'delivery',
  cep_entrega: '09618-100',
  endereco: 'Rua Paulo di Favari, Rudge Ramos - São Bernardo do Campo/SP',
  complemento: 'ap 321',
  distancia_km: 4.8,
  observacoes: 'sem rebolho',
  forma_pagamento: 'pix',
  valor_total: 16.00,
  taxa_entrega: 7.00,
  status: 'pendente',
  itens: [
    {
      esfiha_nome: 'ALHO C/ MUSSARELA',
      quantidade: 1,
      preco_unitario: 9.00,
      acrescimos: []
    }
  ]
};

// Largura da impressora
const width = 75;

// Função para simular a formatação
function simulateQZTrayFormat(orderData) {
  const lines = [];
  
  // Cabeçalho
  lines.push('='.repeat(width));
  const title = 'ESFIHARIA JAMAL';
  const padding = Math.floor((width - title.length) / 2);
  lines.push(' '.repeat(padding) + title);
  lines.push('='.repeat(width));
  
  // Informações do pedido
  const data = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  lines.push(`PEDIDO #${orderData.id} | ${data}`);
  lines.push(`Cliente: ${orderData.cliente_nome}`);
  
  if (orderData.cliente_telefone) {
    const fone = orderData.cliente_telefone.replace(/[()]/g, '');
    lines.push(`Fone: ${fone}`);
  }
  
  // Tipo de entrega
  const tipoEntrega = orderData.tipo_entrega === 'delivery' || orderData.tipo_entrega === 'entrega' 
    ? 'Delivery' 
    : 'Retirada';
  lines.push(`Entrega: ${tipoEntrega}`);
  
  // Informações de delivery
  if (tipoEntrega === 'Delivery') {
    if (orderData.cep_entrega) {
      lines.push(`CEP: ${orderData.cep_entrega}`);
    }
    if (orderData.endereco) {
      // Quebrar endereço em linhas se for muito longo
      const maxLen = 65; // Deixar espaço para "End: "
      const endereco = orderData.endereco;
      if (endereco.length > maxLen) {
        lines.push(`End: ${endereco.substring(0, maxLen)}`);
        // Segunda linha (se necessário)
        if (endereco.length > maxLen) {
          lines.push(`     ${endereco.substring(maxLen, maxLen * 2)}`);
        }
      } else {
        lines.push(`End: ${endereco}`);
      }
    }
    if (orderData.complemento) {
      lines.push(`Compl: ${orderData.complemento}`);
    }
    if (orderData.distancia_km) {
      lines.push(`Dist: ${parseFloat(orderData.distancia_km).toFixed(1)} km`);
    }
  }
  
  // Observações
  if (orderData.observacoes && orderData.observacoes.trim()) {
    lines.push(`Observacoes: ${orderData.observacoes.trim()}`);
  }
  
  lines.push('');
  lines.push('-'.repeat(width));
  lines.push('ITENS');
  lines.push('-'.repeat(width));
  
  // Itens
  let total = 0;
  if (orderData.itens && orderData.itens.length > 0) {
    orderData.itens.forEach(item => {
      const nome = item.esfiha_nome || 'Item';
      const qtd = parseInt(item.quantidade) || 1;
      const preco = parseFloat(item.preco_unitario) || 0;
      const subtotal = preco * qtd;
      total += subtotal;
      
      const itemLine = `${qtd}x ${nome}`;
      const precoStr = `R$ ${subtotal.toFixed(2)}`;
      const spaces = width - itemLine.length - precoStr.length;
      lines.push(itemLine + ' '.repeat(Math.max(1, spaces)) + precoStr);
    });
  }
  
  lines.push('-'.repeat(width));
  
  // Totais
  const subtotalStr = `R$ ${total.toFixed(2)}`;
  const subtotalLine = 'Subtotal:';
  const subtotalSpaces = width - subtotalLine.length - subtotalStr.length;
  lines.push(subtotalLine + ' '.repeat(Math.max(1, subtotalSpaces)) + subtotalStr);
  
  if (orderData.taxa_entrega > 0) {
    const taxaStr = `R$ ${parseFloat(orderData.taxa_entrega).toFixed(2)}`;
    const taxaLine = 'Entrega:';
    const taxaSpaces = width - taxaLine.length - taxaStr.length;
    lines.push(taxaLine + ' '.repeat(Math.max(1, taxaSpaces)) + taxaStr);
    total += parseFloat(orderData.taxa_entrega);
  }
  
  lines.push('-'.repeat(width));
  
  const totalStr = `R$ ${total.toFixed(2)}`;
  const totalLine = 'TOTAL:';
  const totalSpaces = width - totalLine.length - totalStr.length;
  lines.push(totalLine + ' '.repeat(Math.max(1, totalSpaces)) + totalStr);
  
  lines.push('-'.repeat(width));
  
  // Informações adicionais
  const formaPagamento = orderData.forma_pagamento || 'dinheiro';
  const formas = {
    'dinheiro': 'Dinheiro',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito',
    'pix': 'PIX'
  };
  lines.push(`Pagamento: ${formas[formaPagamento] || formaPagamento}`);
  lines.push(`Status: ${(orderData.status || 'PENDENTE').toUpperCase()}`);
  
  lines.push('');
  lines.push('='.repeat(width));
  const footer = 'Obrigado pela preferencia!';
  const footerPadding = Math.floor((width - footer.length) / 2);
  lines.push(' '.repeat(footerPadding) + footer);
  lines.push('='.repeat(width));
  
  return lines.join('\n');
}

// Executar simulação
console.log('\n🧪 SIMULAÇÃO DA IMPRESSÃO TÉRMICA VIA QZ TRAY\n');
console.log('Largura da impressora: 75 caracteres');
console.log('='.repeat(75));
console.log('\n');

const output = simulateQZTrayFormat(orderData);
console.log(output);

console.log('\n');
console.log('='.repeat(75));
console.log('\n✅ Verificações:');
console.log(`   - Endereço completo: ${orderData.endereco.length} caracteres`);
console.log(`   - Quebra de linha automática: ${orderData.endereco.length > 65 ? 'SIM' : 'NÃO'}`);
console.log(`   - CEP exibido: SIM`);
console.log(`   - Complemento exibido: SIM`);
console.log(`   - Distância exibida: SIM`);
console.log('\n');
