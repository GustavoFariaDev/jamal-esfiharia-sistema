import { useState, useCallback } from 'react';
import { useToastContext } from '../contexts/ToastContext';

/**
 * Hook customizado para gerenciar o carrinho de compras
 * Centraliza toda a lógica de adicionar, remover e calcular itens do carrinho
 */
export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const { success, info } = useToastContext();

  /**
   * Adiciona um item ao carrinho
   * Para pizzas meio a meio, sempre adiciona como novo item
   * Para outros produtos, agrupa se forem idênticos
   */
  const addToCart = useCallback((item) => {
    setCart(prevCart => {
      // Para pizzas meio a meio, nunca agrupar - sempre adicionar como novo item
      if (item.isHalfAndHalf) {
        const newItem = {
          ...item,
          quantity: item.quantity || 1,
          cartId: item.cartId || `cart-half-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        success(`${item.customName || item.name} adicionado ao carrinho!`);
        return [...prevCart, newItem];
      }
      
      // Para itens normais, verificar se já existe no carrinho
      const existingItem = prevCart.find(cartItem => 
        cartItem.id === item.id && 
        cartItem.name === item.name &&
        !cartItem.isHalfAndHalf &&
        cartItem.selectedSize === item.selectedSize &&
        cartItem.tipoMassa === item.tipoMassa &&
        JSON.stringify(cartItem.selectedExtras || []) === JSON.stringify(item.selectedExtras || []) &&
        JSON.stringify(cartItem.extras || []) === JSON.stringify(item.extras || [])
      );
      
      if (existingItem) {
        success(`Quantidade de ${item.customName || item.name} aumentada!`);
        return prevCart.map(cartItem =>
          cartItem.cartId === existingItem.cartId
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        );
      }
      
      // Adicionar novo item com ID único para o carrinho
      const newItem = { 
        ...item, 
        quantity: item.quantity || 1,
        cartId: item.cartId || `cart-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      success(`${item.customName || item.name} adicionado ao carrinho!`);
      return [...prevCart, newItem];
    });
  }, [success]);

  /**
   * Remove uma unidade do item ou remove o item se quantidade for 1
   */
  const removeFromCart = useCallback((cartId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.cartId === cartId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.cartId !== cartId);
    });
  }, []);

  /**
   * Remove completamente um item do carrinho
   */
  const deleteFromCart = useCallback((cartId) => {
    const item = cart.find(i => i.cartId === cartId);
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    if (item) {
      info(`${item.customName || item.name} removido do carrinho`);
    }
  }, [cart, info]);

  /**
   * Limpa todo o carrinho
   */
  const clearCart = useCallback(() => {
    setCart([]);
    setDeliveryInfo(null);
    info('Carrinho limpo');
  }, [info]);

  /**
   * Calcula o subtotal do carrinho (sem taxa de entrega)
   */
  const getCartSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  /**
   * Calcula o total do carrinho (com taxa de entrega)
   */
  const getCartTotal = useCallback(() => {
    const subtotal = getCartSubtotal();
    const deliveryFee = deliveryInfo ? deliveryInfo.fee : 0;
    return subtotal + deliveryFee;
  }, [getCartSubtotal, deliveryInfo]);

  /**
   * Retorna a quantidade total de itens no carrinho
   */
  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  /**
   * Atualiza as informações de entrega
   */
  const updateDeliveryInfo = useCallback((info) => {
    setDeliveryInfo(info);
  }, []);

  return {
    cart,
    deliveryInfo,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
    getCartSubtotal,
    getCartTotal,
    getCartItemCount,
    updateDeliveryInfo,
    setCart
  };
};

export default useCart;
