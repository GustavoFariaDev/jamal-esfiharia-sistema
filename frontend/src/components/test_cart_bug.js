// Teste para reproduzir o bug do carrinho

const cart = [
  {
    cartId: "cart-half-1-2-1731029000-abc123",
    name: "Pizza Meio a Meio (Grande): 3 QUEIJOS / 4 QUEIJOS",
    quantity: 1,
    price: 92.00,
    isHalfAndHalf: true
  },
  {
    cartId: "cart-half-1-2-1731029100-def456",
    name: "Pizza Meio a Meio (Grande): 3 QUEIJOS / 4 QUEIJOS",
    quantity: 1,
    price: 92.00,
    isHalfAndHalf: true
  }
];

// Função removeFromCart atual
const removeFromCart = (cartId) => {
  const existingItem = cart.find(item => item.cartId === cartId);
  console.log("Removendo cartId:", cartId);
  console.log("Item encontrado:", existingItem);
  
  if (existingItem && existingItem.quantity > 1) {
    console.log("Decrementando quantidade");
    return cart.map(item =>
      item.cartId === cartId
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
  }
  
  console.log("Removendo item completamente");
  const newCart = cart.filter(item => item.cartId !== cartId);
  console.log("Carrinho após remoção:", newCart);
  return newCart;
};

// Testar remoção do primeiro item
console.log("=== TESTE: Remover primeiro item ===");
console.log("Carrinho inicial:", cart.length, "itens");
const result = removeFromCart("cart-half-1-2-1731029000-abc123");
console.log("Carrinho final:", result.length, "itens");
console.log("Esperado: 1 item | Atual:", result.length);
