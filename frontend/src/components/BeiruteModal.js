import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ExtrasSelector from './ExtrasSelector';

const BeiruteModal = ({ isOpen, onClose, beirute, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('grande');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen && beirute) {
      setSelectedSize('grande');
      setSelectedExtras([]);
      setQuantity(1);
    }
  }, [isOpen, beirute]);

  if (!isOpen || !beirute) return null;

  // Preços por tamanho
  const getSizePrice = (size) => {
    switch (size) {
      case 'broto':
        return beirute.preco_broto || 0;
      case 'media':
        return beirute.preco_media || 0;
      case 'grande':
        return beirute.preco_grande || 0;
      default:
        return beirute.preco_grande || 0;
    }
  };

  // Calcular preço total
  const calculateTotalPrice = () => {
    const basePrice = getSizePrice(selectedSize);
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + (extra.preco || 0), 0);
    return (basePrice + extrasPrice) * quantity;
  };

  const handleConfirm = () => {
    const sizeLabels = { broto: 'Broto', media: 'Média', grande: 'Grande' };
    
    let customName = `${beirute.name} (${sizeLabels[selectedSize]})`;
    if (selectedExtras.length > 0) {
      customName += ' + ' + selectedExtras.map(e => e.nome).join(', ');
    }

    const productData = {
      ...beirute,
      selectedSize,
      price: calculateTotalPrice() / quantity,
      selectedExtras,
      quantity,
      customName
    };

    onAddToCart(productData);
    onClose();
  };

  const sizeLabels = { broto: 'Broto', media: 'Média', grande: 'Grande' };
  const sizePieces = { broto: '4 pedaços', media: '6 pedaços', grande: '8 pedaços' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">{beirute.name}</h2>
            <p className="text-red-100 text-sm mt-1">{beirute.description}</p>
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
            <div className="grid grid-cols-3 gap-3">
              {['broto', 'media', 'grande'].map((size) => {
                const sizePrice = getSizePrice(size);
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedSize === size
                        ? 'border-red-600 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{sizeLabels[size]}</div>
                      <div className="text-xs text-gray-500 mt-1">{sizePieces[size]}</div>
                      <div className="text-lg font-bold text-red-600 mt-1">
                        R$ {sizePrice.toFixed(2)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acréscimos (mesmos das esfihas, SEM borda) */}
          <ExtrasSelector
            productType="esfiha"
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
          {(selectedExtras.length > 0 || quantity > 1) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Resumo:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{beirute.name} ({sizeLabels[selectedSize]})</span>
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
            className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeiruteModal;
