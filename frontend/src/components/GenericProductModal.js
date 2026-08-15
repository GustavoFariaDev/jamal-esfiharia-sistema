import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatarPreco } from '../utils/formato';

const GenericProductModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen && product) {
      setSelectedExtras([]);
      setQuantity(1);
      fetchExtras();
    }
  }, [isOpen, product]);

  // Buscar acréscimos da API baseado na categoria
  const fetchExtras = async () => {
    try {
      setLoading(true);
      const category = product.category?.toLowerCase() || '';
      let tipo = '';
      
      // Determinar tipo de acréscimo baseado na categoria
      // Esfihas, Pastéis e Fogazzas usam o mesmo tipo de acréscimo
      if (category.includes('esfiha') || category.includes('pastel') || category.includes('pastéis') || category.includes('fogazz')) {
        tipo = 'esfiha';
      } else if (category.includes('batata')) {
        tipo = 'batata_recheio';
      } else if (category.includes('pizza')) {
        // Pizzas não têm acréscimos genéricos (usam modal específico)
        tipo = '';
      } else {
        // Outros produtos (bebidas, salgados, etc) não têm acréscimos
        tipo = '';
      }
      
      // Só buscar se tiver tipo definido
      if (tipo) {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || '/api'}/acrescimos?tipo=${tipo}`);
        const result = await response.json();
        
        if (result.status === 'success') {
          setAvailableExtras(result.data || []);
        }
      } else {
        setAvailableExtras([]);
      }
    } catch (error) {
      console.error('Erro ao buscar acréscimos:', error);
      setAvailableExtras([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  // Calcular preço total
  const calculateTotalPrice = () => {
    const basePrice = product.price || product.preco || 0;
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + (extra.preco || 0), 0);
    return (basePrice + extrasPrice) * quantity;
  };

  // Toggle acréscimo
  const handleExtraToggle = (extra) => {
    const isBatata = product.category?.toLowerCase().includes('batata');
    const isSelected = selectedExtras.some(e => e.id === extra.id);
    
    if (isBatata) {
      // Para batatas: comportamento de radio button (apenas 1 selecionado)
      setSelectedExtras([extra]);
    } else {
      // Para outros produtos: comportamento de checkbox (múltiplos)
      if (isSelected) {
        setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
      } else {
        setSelectedExtras([...selectedExtras, extra]);
      }
    }
  };

  // Adicionar ao carrinho
  const handleAddToCart = () => {
    const item = {
      ...product,
      extras: selectedExtras,
      quantity: quantity,
      price: calculateTotalPrice() / quantity, // Preço unitário com acréscimos
      customName: `${product.name}${selectedExtras.length > 0 ? ' + ' + selectedExtras.map(e => e.nome).join(', ') : ''}`
    };
    
    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-red-100 text-sm mt-1">{product.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Acréscimos */}
          {availableExtras.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {product.category?.toLowerCase().includes('batata') ? 'Escolha o Recheio' : 'Acréscimos'} <span className="text-sm font-normal text-gray-500">{product.category?.toLowerCase().includes('batata') ? '(Obrigatório)' : '(Opcional)'}</span>
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-gray-600">Carregando acréscimos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableExtras.map((extra) => {
                    const isSelected = selectedExtras.some(e => e.id === extra.id);
                    const isBatata = product.category?.toLowerCase().includes('batata');
                    
                    return (
                      <button
                        key={extra.id}
                        onClick={() => handleExtraToggle(extra)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? (isBatata ? 'border-orange-600 bg-orange-50' : 'border-red-600 bg-red-50')
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{extra.nome}</div>
                            <div className={`text-sm font-bold ${
                              isBatata ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isBatata ? 'Incluído' : `+ ${formatarPreco(extra.preco)}`}
                            </div>
                          </div>
                          <div className={`w-5 h-5 ${isBatata ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center ${
                            isSelected ? (isBatata ? 'bg-orange-600 border-orange-600' : 'bg-red-600 border-red-600') : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quantidade */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Quantidade</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-xl"
              >
                -
              </button>
              <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Resumo */}
          {selectedExtras.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Resumo:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{product.name}</span>
                  <span className="font-semibold">{formatarPreco((product.price || product.preco))}</span>
                </div>
                {selectedExtras.map((extra) => (
                  <div key={extra.id} className="flex justify-between text-gray-600">
                    <span>+ {extra.nome}</span>
                    <span>{formatarPreco(extra.preco)}</span>
                  </div>
                ))}
                {quantity > 1 && (
                  <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
                    <span>Quantidade</span>
                    <span>× {quantity}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Total:</span>
            <span className="text-3xl font-bold text-red-600">
              {formatarPreco(calculateTotalPrice())}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericProductModal;
