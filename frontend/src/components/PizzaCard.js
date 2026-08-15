import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ExtrasSelector from './ExtrasSelector';
import { formatarPreco } from '../utils/formato';

const PizzaCard = ({ item, onAddToCart, onImageError, onHalfAndHalf, allPizzas }) => {
  const [selectedSize, setSelectedSize] = useState('grande');
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Verificar se é pizza pela categoria
  const isPizza = item.category && (
    item.category.toLowerCase().includes('pizza') ||
    item.category.toLowerCase().includes('pizzas')
  );

  const isEsfiha = item.category && item.category.toLowerCase().includes('esfiha');

  // Para pizzas, SEMPRE mostrar seletor de tamanhos
  const showSizeSelector = isPizza;

  // Determinar tipo de produto para ExtrasSelector
  const getProductType = () => {
    if (isPizza) return 'pizza';
    if (isEsfiha) return 'esfiha';
    return null;
  };

  const getSizePrice = (size) => {
    switch (size) {
      case 'grande':
        return item.preco_grande || item.price || 0;
      case 'media':
        return item.preco_media || item.price || 0;
      case 'broto':
        return item.preco_broto || item.price || 0;
      default:
        return item.price || 0;
    }
  };

  const getCurrentPrice = () => {
    let basePrice = item.price || 0;
    
    if (showSizeSelector) {
      basePrice = getSizePrice(selectedSize);
    }
    
    // Adicionar preço dos acréscimos
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + (extra.preco || 0), 0);
    
    return basePrice + extrasPrice;
  };

  const getSizeLabel = (size) => {
    const labels = { 
      broto: 'Broto', 
      media: 'Média', 
      grande: 'Grande' 
    };
    return labels[size] || size;
  };

  const handleAddToCart = () => {
    let productName = item.name;
    
    if (showSizeSelector) {
      productName = `${item.name} (${getSizeLabel(selectedSize)})`;
    }
    
    // Adicionar acréscimos ao nome
    if (selectedExtras.length > 0) {
      const extrasNames = selectedExtras.map(e => e.nome).join(', ');
      productName += ` + ${extrasNames}`;
    }
    
    onAddToCart({
      ...item,
      price: getCurrentPrice(),
      selectedSize: showSizeSelector ? selectedSize : undefined,
      selectedExtras: selectedExtras,
      name: productName
    });
    
    // Limpar seleções de acréscimos após adicionar
    setSelectedExtras([]);
  };

  const handleHalfAndHalf = () => {
    if (onHalfAndHalf) {
      onHalfAndHalf(item, selectedSize);
    }
  };

  console.log('PizzaCard Debug:', {
    itemName: item.name,
    category: item.category,
    isPizza: isPizza,
    showSizeSelector: showSizeSelector,
    hasOnHalfAndHalf: !!onHalfAndHalf,
    hasAllPizzas: !!allPizzas
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <img
        src={item.imagem_url}
        alt={item.name}
        onError={onImageError}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        {/* PARA PIZZAS - SEMPRE MOSTRAR TUDO */}
        {isPizza ? (
          <>
            {/* ==================== SELETOR DE TAMANHO ==================== */}
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Escolha o tamanho:
              </label>
              <div className="space-y-2">
                {['broto', 'media', 'grande'].map((size) => {
                  const sizePrice = getSizePrice(size);
                  return (
                    <label
                      key={size}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSize === size
                          ? 'border-red-600 bg-red-50 shadow-md'
                          : 'border-gray-300 bg-white hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`size-${item.id}`}
                          value={size}
                          checked={selectedSize === size}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-5 h-5 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-bold text-gray-900">
                          {getSizeLabel(size)}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        {formatarPreco(sizePrice)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ==================== BOTÃO MEIO A MEIO ==================== */}
            {onHalfAndHalf && allPizzas && (
              <button
                onClick={handleHalfAndHalf}
                className="w-full mb-4 px-4 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-bold text-base"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                  <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2"/>
                </svg>
                Montar pizza meio a meio
              </button>
            )}
            
            {/* ==================== SELETOR DE ACRÉSCIMOS ==================== */}
            <div className="mb-4">
              <ExtrasSelector
                productType="pizza"
                selectedExtras={selectedExtras}
                onExtrasChange={setSelectedExtras}
              />
            </div>
            
            {/* ==================== BOTÃO ADICIONAR ==================== */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-green-600 text-white px-4 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-md hover:shadow-lg"
            >
              <Plus className="w-6 h-6" />
              Adicionar ao Carrinho - {formatarPreco(getCurrentPrice())}
            </button>
          </>
        ) : (
          /* PARA OUTROS PRODUTOS (NÃO PIZZAS) */
          <>
            {/* Acréscimos para esfihas */}
            {isEsfiha && (
              <div className="mb-4">
                <ExtrasSelector
                  productType="esfiha"
                  selectedExtras={selectedExtras}
                  onExtrasChange={setSelectedExtras}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">
                {formatarPreco(getCurrentPrice())}
              </span>
              <button
                onClick={handleAddToCart}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PizzaCard;
