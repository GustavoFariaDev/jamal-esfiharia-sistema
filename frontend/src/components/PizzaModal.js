import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ExtrasSelector from './ExtrasSelector';
import HalfAndHalfSelector from './HalfAndHalfSelector';

const PizzaModal = ({ isOpen, onClose, pizza, allPizzas, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('grande');
  const [showMeioAMeio, setShowMeioAMeio] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen && pizza) {
      setSelectedSize('grande');
      setShowMeioAMeio(false);
      setSelectedExtras([]);
      setQuantity(1);
    }
  }, [isOpen, pizza]);

  if (!isOpen || !pizza) return null;

  // Detectar se é batata recheada
  const isBatata = pizza.category && pizza.category.toLowerCase().includes('batata');

  // Preços por tamanho
  const getSizePrice = (size) => {
    switch (size) {
      case 'broto':
        return pizza.preco_broto || 0;
      case 'media':
        return pizza.preco_media || 0;
      case 'grande':
        return pizza.preco_grande || 0;
      default:
        return pizza.preco_grande || 0;
    }
  };

  // Calcular preço total
  const calculateTotalPrice = () => {
    const basePrice = getSizePrice(selectedSize);
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + (extra.preco || 0), 0);
    return (basePrice + extrasPrice) * quantity;
  };

  const handleConfirm = () => {
    const productData = {
      ...pizza,
      selectedSize,
      price: calculateTotalPrice() / quantity,
      selectedExtras,
      quantity,
      customName: `${pizza.name} (${selectedSize})${selectedExtras.length > 0 ? ' + ' + selectedExtras.map(e => e.nome).join(', ') : ''}`
    };

    onAddToCart(productData);
    onClose();
  };

  const handleMeioAMeioClick = () => {
    setShowMeioAMeio(true);
  };

  const handleMeioAMeioConfirm = (data) => {
    const { firstHalf, secondHalf, price, firstHalfExtras = [], secondHalfExtras = [], selectedBorda = null } = data;
    
    const getSizeLabel = () => {
      const labels = {
        'grande': 'Grande',
        'media': 'Média',
        'broto': 'Broto'
      };
      return labels[selectedSize] || 'Grande';
    };

    // Construir nome detalhado do item
    let itemName = `Pizza Meio a Meio (${getSizeLabel()}): ${firstHalf.name} / ${secondHalf.name}`;
    
    // Adicionar acréscimos da primeira metade
    if (firstHalfExtras.length > 0) {
      const extrasNames = firstHalfExtras.map(e => e.nome).join(', ');
      itemName += ` | Metade A + ${extrasNames}`;
    }
    
    // Adicionar acréscimos da segunda metade
    if (secondHalfExtras.length > 0) {
      const extrasNames = secondHalfExtras.map(e => e.nome).join(', ');
      itemName += ` | Metade B + ${extrasNames}`;
    }
    
    // Adicionar borda
    if (selectedBorda) {
      itemName += ` | Borda: ${selectedBorda.nome}`;
    }

    const halfAndHalfItem = {
      id: `half-${firstHalf.id}-${secondHalf.id}-${Date.now()}`,
      name: itemName,
      customName: itemName,
      price: price,
      category: firstHalf.category,
      description: `Metade ${firstHalf.name}, Metade ${secondHalf.name}`,
      imagem_url: firstHalf.imagem_url,
      isHalfAndHalf: true,
      firstHalf: firstHalf,
      secondHalf: secondHalf,
      selectedSize: selectedSize,
      firstHalfExtras: firstHalfExtras,
      secondHalfExtras: secondHalfExtras,
      selectedBorda: selectedBorda,
      quantity: 1
    };

    onAddToCart(halfAndHalfItem);
    onClose();
  };

  return (
    <>
      {showMeioAMeio ? (
        <HalfAndHalfSelector
          isOpen={showMeioAMeio}
          onClose={() => setShowMeioAMeio(false)}
          currentItem={pizza}
          allPizzas={allPizzas}
          selectedSize={selectedSize}
          onConfirm={handleMeioAMeioConfirm}
        />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold">{pizza.name}</h2>
                <p className="text-red-100 text-sm mt-1">{pizza.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Seleção de Tamanho */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Tamanho</h3>
                <div className={`grid gap-3 ${isBatata ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {(isBatata ? ['media', 'grande'] : ['broto', 'media', 'grande']).map((size) => {
                    const sizePrice = getSizePrice(size);
                    const sizeLabels = isBatata 
                      ? { media: 'Pequena', grande: 'Grande' }
                      : { broto: 'Broto', media: 'Média', grande: 'Grande' };
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedSize === size
                            ? (isBatata ? 'border-orange-600 bg-orange-50 shadow-md' : 'border-red-600 bg-red-50 shadow-md')
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{sizeLabels[size]}</div>
                          <div className={`text-lg font-bold mt-1 ${isBatata ? 'text-orange-600' : 'text-red-600'}`}>
                            R$ {sizePrice.toFixed(2)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Meio a Meio - Apenas para pizzas */}
              {!isBatata && (
                <button
                  onClick={handleMeioAMeioClick}
                  className="w-full px-4 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-bold text-base"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2"/>
                  </svg>
                  🍕 Montar Pizza Meio a Meio
                </button>
              )}

              {/* Acréscimos e Bordas */}
              <ExtrasSelector
                productType={isBatata ? "batata" : "pizza"}
                isHalfAndHalf={false}
                selectedExtras={selectedExtras}
                onExtrasChange={setSelectedExtras}
              />

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
                      <span className="text-gray-600">{pizza.name} ({selectedSize})</span>
                      <span className="font-semibold">R$ {getSizePrice(selectedSize).toFixed(2)}</span>
                    </div>
                    {selectedExtras.map((extra) => (
                      <div key={extra.id} className="flex justify-between text-gray-600">
                        <span>+ {extra.nome}</span>
                        <span>R$ {extra.preco.toFixed(2)}</span>
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
                  R$ {calculateTotalPrice().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleConfirm}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PizzaModal;
