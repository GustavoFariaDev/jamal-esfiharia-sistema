import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import DeliveryCalculator from '../DeliveryCalculator';
import { formatarPreco } from '../../utils/formato';

/**
 * Modal do Carrinho de Compras
 * Exibe itens do carrinho, tipo de entrega e formulário de checkout
 */
const CartModal = ({
  isOpen,
  onClose,
  cart,
  deliveryType,
  setDeliveryType,
  deliveryInfo,
  customerInfo,
  setCustomerInfo,
  customerHistory,
  isLoadingHistory,
  onAddToCart,
  onRemoveFromCart,
  onDeleteFromCart,
  onDeliveryFeeCalculated,
  onBuscarHistoricoCliente,
  onFinalizarPedido,
  isProcessing,
  getCartItemCount,
  getCartSubtotal,
  getCartTotal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Carrinho</h2>
            <p className="text-red-100 text-sm">{getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'itens'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Itens do Carrinho */}
        <div className="p-6 space-y-4">
          {cart.map((item) => (
            <div key={item.cartId} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.customName || item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteFromCart(item.cartId)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onRemoveFromCart(item.cartId)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg">{item.quantity}</span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatarPreco(item.price)} cada</p>
                  <p className="text-lg font-bold text-red-600">{formatarPreco((item.price * item.quantity))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tipo de Entrega */}
        <div className="px-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de entrega</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryType('entrega')}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                deliveryType === 'entrega'
                  ? 'bg-red-600 text-white border-2 border-red-600'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
              }`}
            >
              Entrega em casa
            </button>
            <button
              onClick={() => setDeliveryType('retirada')}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                deliveryType === 'retirada'
                  ? 'bg-green-600 text-white border-2 border-green-600'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
              }`}
            >
              Retirada no local
            </button>
          </div>

          {/* Calculadora de Entrega - Apenas para entrega */}
          {deliveryType === 'entrega' && (
            <div className="mt-4">
              <DeliveryCalculator onFeeCalculated={onDeliveryFeeCalculated} />
            </div>
          )}
        </div>

        {/* Dados do Cliente */}
        <div className="px-6 pb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dados do cliente</h3>
          <div className="space-y-3">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="Digite seu nome"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone *</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => {
                  // Extrair apenas números do input
                  let value = e.target.value.replace(/\D/g, '');
                  
                  // LIMITAR ESTRITAMENTE a 11 dígitos
                  value = value.slice(0, 11);
                  
                  // Aplicar máscara (11) 98765-4321
                  let formatted = '';
                  if (value.length > 0) {
                    formatted = '(' + value.substring(0, 2);
                    if (value.length >= 2) {
                      formatted += ') ';
                    }
                    if (value.length > 2) {
                      formatted += value.substring(2, 7);
                    }
                    if (value.length > 7) {
                      formatted += '-' + value.substring(7, 11);
                    }
                  }
                  
                  setCustomerInfo({...customerInfo, phone: formatted});
                  
                  // Buscar histórico apenas se tiver 11 dígitos
                  if (value.length === 11) {
                    onBuscarHistoricoCliente(formatted);
                  }
                }}
                placeholder="(11) 98765-4321"
                maxLength="15"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              />
              {isLoadingHistory && (
                <p className="text-sm text-gray-500 mt-1">Buscando histórico...</p>
              )}
              {customerHistory && (
                <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <p className="text-sm text-green-900 font-semibold flex items-center gap-2">
                                        Cliente cadastrado! {customerHistory.total_pedidos} pedido(s) anterior(es)
                  </p>
                </div>
              )}
            </div>

            {/* Endereço - Apenas para entrega */}
            {deliveryType === 'entrega' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço Completo *</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    readOnly
                    placeholder="Preencha o CEP acima para buscar o endereço"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    title="O endereço é preenchido automaticamente após informar o CEP"
                  />
                  {!customerInfo.address && deliveryInfo && (
                    <p className="text-xs text-amber-600 mt-1">O endereço é preenchido pelo CEP</p>
                  )}
                </div>

                {/* Número */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Número *</label>
                  <input
                    type="text"
                    value={customerInfo.numero || ''}
                    onChange={(e) => setCustomerInfo({...customerInfo, numero: e.target.value})}
                    placeholder="Número da residência"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Complemento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={customerInfo.complement || ''}
                    onChange={(e) => setCustomerInfo({...customerInfo, complement: e.target.value})}
                    placeholder="Apto, Bloco, etc (opcional)"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Mensagem para retirada */}
            {deliveryType === 'retirada' && (
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-sm text-green-900 font-semibold flex items-center gap-2">
                                    Você escolheu retirar no local. Não é necessário informar endereço.
                </p>
              </div>
            )}

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Forma de Pagamento *</label>
              <div className="mb-2 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <p className="text-sm text-blue-900 font-semibold flex items-center gap-2">
                                    O pagamento será feito com o motoboy na entrega
                </p>
              </div>
              <select
                value={customerInfo.paymentMethod}
                onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="pix">PIX</option>
              </select>
            </div>

            {/* Troco (apenas se for dinheiro) */}
            {customerInfo.paymentMethod === 'dinheiro' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Troco para quanto?</label>
                <input
                  type="text"
                  value={customerInfo.change || ''}
                  onChange={(e) => setCustomerInfo({...customerInfo, change: e.target.value})}
                  placeholder="R$ 100,00"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
              <textarea
                value={customerInfo.observations || ''}
                onChange={(e) => setCustomerInfo({...customerInfo, observations: e.target.value})}
                placeholder="Ex: Entregar sem cebola na metade B"
                rows="3"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Resumo e Botão Finalizar */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatarPreco(getCartSubtotal())}</span>
            </div>
            {deliveryType === 'entrega' && deliveryInfo && (
              <div className="flex justify-between text-gray-700">
                <span>Taxa de Entrega:</span>
                <span className="font-semibold">{formatarPreco(deliveryInfo.fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-200">
              <span>Total:</span>
              <span className="text-red-600">{formatarPreco(getCartTotal())}</span>
            </div>
          </div>

          <button
            onClick={onFinalizarPedido}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? 'Processando...' : 'Finalizar pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
