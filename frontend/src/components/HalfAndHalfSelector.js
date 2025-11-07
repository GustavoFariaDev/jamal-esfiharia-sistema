import React, { useState, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';

const HalfAndHalfSelector = ({ isOpen, onClose, onConfirm, currentItem, allPizzas, selectedSize }) => {
  const [firstHalf, setFirstHalf] = useState(null);
  const [secondHalf, setSecondHalf] = useState(null);
  const [firstHalfExtras, setFirstHalfExtras] = useState([]);
  const [secondHalfExtras, setSecondHalfExtras] = useState([]);
  const [selectedBorda, setSelectedBorda] = useState(null);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [availableBordas, setAvailableBordas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('metade_a');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && currentItem) {
      setFirstHalf(currentItem);
      setSecondHalf(null);
      setFirstHalfExtras([]);
      setSecondHalfExtras([]);
      setSelectedBorda(null);
      setActiveTab('metade_a');
      setSearchTerm('');
      fetchExtras();
    }
  }, [isOpen, currentItem]);

  const fetchExtras = async () => {
    try {
      setLoading(true);
      
      // Buscar acréscimos por metade
      const extrasResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/acrescimos?tipo=pizza_metade`);
      const extrasResult = await extrasResponse.json();
      
      if (extrasResult.status === 'success') {
        setAvailableExtras(extrasResult.data || []);
      }
      
      // Buscar bordas
      const bordasResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/acrescimos?tipo=borda`);
      const bordasResult = await bordasResponse.json();
      
      if (bordasResult.status === 'success') {
        setAvailableBordas(bordasResult.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar acréscimos:', error);
      setAvailableExtras([]);
      setAvailableBordas([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const calculatePrice = () => {
    if (!firstHalf || !secondHalf) return 0;
    
    const getPrice = (pizza) => {
      switch (selectedSize) {
        case 'grande':
          return pizza.preco_grande || pizza.price;
        case 'media':
          return pizza.preco_media || pizza.price;
        case 'broto':
          return pizza.preco_broto || pizza.price;
        default:
          return pizza.price;
      }
    };

    const price1 = getPrice(firstHalf);
    const price2 = getPrice(secondHalf);
    const basePrice = Math.max(price1, price2);
    
    const extrasPrice = firstHalfExtras.reduce((sum, extra) => sum + extra.preco, 0) +
                        secondHalfExtras.reduce((sum, extra) => sum + extra.preco, 0);
    
    const bordaPrice = selectedBorda ? selectedBorda.preco : 0;
    
    return basePrice + extrasPrice + bordaPrice;
  };

  const handleConfirm = () => {
    if (firstHalf && secondHalf) {
      onConfirm({
        firstHalf,
        secondHalf,
        price: calculatePrice(),
        firstHalfExtras,
        secondHalfExtras,
        selectedBorda,
        isHalfAndHalf: true
      });
      onClose();
    }
  };

  const getSizeLabel = () => {
    const labels = {
      'grande': 'Grande',
      'media': 'Média',
      'broto': 'Broto'
    };
    return labels[selectedSize] || 'Grande';
  };

  const toggleExtra = (extra, metade) => {
    if (metade === 'a') {
      const isSelected = firstHalfExtras.some(e => e.id === extra.id);
      if (isSelected) {
        setFirstHalfExtras(firstHalfExtras.filter(e => e.id !== extra.id));
      } else {
        setFirstHalfExtras([...firstHalfExtras, extra]);
      }
    } else {
      const isSelected = secondHalfExtras.some(e => e.id === extra.id);
      if (isSelected) {
        setSecondHalfExtras(secondHalfExtras.filter(e => e.id !== extra.id));
      } else {
        setSecondHalfExtras([...secondHalfExtras, extra]);
      }
    }
  };

  const isExtraSelected = (extraId, metade) => {
    if (metade === 'a') {
      return firstHalfExtras.some(e => e.id === extraId);
    } else {
      return secondHalfExtras.some(e => e.id === extraId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">🍕 Pizza Meio a Meio</h2>
            <p className="text-red-100 text-sm mt-1">Escolha 2 sabores - Tamanho: {getSizeLabel()}</p>
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
          {/* Primeira Metade */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Primeira Metade
            </h3>
            {firstHalf && (
              <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{firstHalf.name}</p>
                    <p className="text-sm text-gray-600">{firstHalf.description}</p>
                  </div>
                  <Check className="w-6 h-6 text-red-600" />
                </div>
              </div>
            )}
          </div>

          {/* Segunda Metade */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Segunda Metade - Escolha o sabor:
            </h3>
            
            {secondHalf ? (
              <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{secondHalf.name}</p>
                    <p className="text-sm text-gray-600">{secondHalf.description}</p>
                  </div>
                  <button
                    onClick={() => setSecondHalf(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Campo de Busca */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar sabor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                
                {/* Lista de Pizzas */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allPizzas
                    .filter(pizza => 
                      pizza.id !== firstHalf?.id && 
                      pizza.disponivel &&
                      (pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (pizza.description && pizza.description.toLowerCase().includes(searchTerm.toLowerCase())))
                    )
                    .map((pizza) => (
                      <button
                        key={pizza.id}
                        onClick={() => setSecondHalf(pizza)}
                        className="w-full text-left p-3 border-2 rounded-lg transition-all border-gray-200 hover:border-red-300 bg-white"
                      >
                        <p className="font-bold text-gray-900 text-base">{pizza.name}</p>
                        {pizza.description && (
                          <p className="text-xs text-gray-600 mt-1">{pizza.description}</p>
                        )}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>

          {/* Acréscimos por Metade */}
          {firstHalf && secondHalf && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                🧀 Acréscimos e Bordas
              </h3>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('metade_a')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'metade_a'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Metade A ({firstHalf.name})
                </button>
                <button
                  onClick={() => setActiveTab('metade_b')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'metade_b'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Metade B ({secondHalf.name})
                </button>
                <button
                  onClick={() => setActiveTab('borda')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'borda'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔲 Borda
                </button>
              </div>

              {/* Conteúdo das Tabs */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-gray-600">Carregando acréscimos...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeTab === 'metade_a' && (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Selecione acréscimos para a metade <strong>{firstHalf.name}</strong>
                      </p>
                      {availableExtras.map((extra) => (
                        <label
                          key={extra.id}
                          className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isExtraSelected(extra.id, 'a')
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isExtraSelected(extra.id, 'a')}
                              onChange={() => toggleExtra(extra, 'a')}
                              className="w-5 h-5 text-red-600 focus:ring-red-500 rounded"
                            />
                            <span className="ml-3 font-semibold text-gray-900">{extra.nome}</span>
                          </div>
                          <span className="font-bold text-red-600">
                            + R$ {extra.preco.toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </>
                  )}

                  {activeTab === 'metade_b' && (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Selecione acréscimos para a metade <strong>{secondHalf.name}</strong>
                      </p>
                      {availableExtras.map((extra) => (
                        <label
                          key={extra.id}
                          className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isExtraSelected(extra.id, 'b')
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isExtraSelected(extra.id, 'b')}
                              onChange={() => toggleExtra(extra, 'b')}
                              className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <span className="ml-3 font-semibold text-gray-900">{extra.nome}</span>
                          </div>
                          <span className="font-bold text-blue-600">
                            + R$ {extra.preco.toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </>
                  )}

                  {activeTab === 'borda' && (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Escolha <strong>uma borda</strong> para sua pizza
                      </p>
                      {availableBordas.map((borda) => (
                        <label
                          key={borda.id}
                          className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedBorda?.id === borda.id
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="borda"
                              checked={selectedBorda?.id === borda.id}
                              onChange={() => setSelectedBorda(borda)}
                              className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-3 font-semibold text-gray-900">{borda.nome}</span>
                          </div>
                          <span className="font-bold text-orange-600">
                            + R$ {borda.preco.toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resumo */}
          {firstHalf && secondHalf && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">Resumo:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pizza Meio a Meio ({getSizeLabel()})</span>
                  <span className="font-semibold">R$ {Math.max(
                    firstHalf[`preco_${selectedSize}`] || 0,
                    secondHalf[`preco_${selectedSize}`] || 0
                  ).toFixed(2)}</span>
                </div>
                
                {firstHalfExtras.length > 0 && (
                  <div className="text-gray-600">
                    <div className="font-semibold text-red-600">Metade A ({firstHalf.name}):</div>
                    {firstHalfExtras.map((extra) => (
                      <div key={extra.id} className="flex justify-between ml-4">
                        <span>+ {extra.nome}</span>
                        <span>R$ {extra.preco.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {secondHalfExtras.length > 0 && (
                  <div className="text-gray-600">
                    <div className="font-semibold text-blue-600">Metade B ({secondHalf.name}):</div>
                    {secondHalfExtras.map((extra) => (
                      <div key={extra.id} className="flex justify-between ml-4">
                        <span>+ {extra.nome}</span>
                        <span>R$ {extra.preco.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedBorda && (
                  <div className="flex justify-between text-gray-600">
                    <span>Borda: {selectedBorda.nome}</span>
                    <span>R$ {selectedBorda.preco.toFixed(2)}</span>
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
              R$ {calculatePrice().toFixed(2)}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!firstHalf || !secondHalf}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Meio a Meio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfAndHalfSelector;
