/**
 * Formatação de valores em real.
 *
 * O sistema inteiro escrevia `R$ {valor.toFixed(2)}`, e toFixed é uma função
 * de ponto flutuante em inglês: o preço aparecia como "R$ 32.00" em todo o
 * cardápio, no carrinho, no painel e no acompanhamento do pedido. Em português
 * o separador decimal é a vírgula, e ponto é separador de milhar — "R$ 1.500"
 * lido do jeito errado é mil e quinhentos ou um e meio, dependendo de quem lê.
 *
 * Um lugar só para essa decisão: se um dia mudar (centavos ocultos, outra
 * moeda), muda aqui.
 */

/** 32.5 -> "R$ 32,50" */
export function formatarPreco(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'R$ 0,00';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 32.5 -> "32,50" — quando o "R$" já está escrito no layout. */
export function formatarValor(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '0,00';
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
