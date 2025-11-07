import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EsfihaModal = ({ isOpen, onClose, esfiha, onAddToCart }) => {
  const [tipoMassa, setTipoMassa] = useState('aberta');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen && esfiha) {
      setTipoMassa('aberta');
      setSelectedExtras([]);
      setQuantity(1);
      fetchExtras();
    }
  }, [isOpen, esfiha]);

  // Buscar acréscimos da API
  const fetchExtras = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/acrescimos?tipo=esfiha`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setAvailableExtras(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar acréscimos:', error);
      setAvailableExtras([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !esfiha) return null;

  // Calcular preço total
  const calculateTotalPrice = () => {
    const basePrice = esfiha.price || esfiha.preco || 0;
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + (extra.preco || 0), 0);
    return (basePrice + extrasPrice) * quantity;
  };

  // Toggle acréscimo
  const handleExtraToggle = (extra) => {
    const isSelected = selectedExtras.some(e => e.id === extra.id);
    
    if (isSelected) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  // Adicionar ao carrinho
  const handleAddToCart = () => {
    const item = {
      ...esfiha,
      tipoMassa: tipoMassa,
      extras: selectedExtras,
      quantity: quantity,
      price: calculateTotalPrice() / quantity, // Preço unitário com acréscimos
      customName: `${esfiha.name} (${tipoMassa === 'aberta' ? 'Aberta' : 'Fechada'})${selectedExtras.length > 0 ? ' + ' + selectedExtras.map(e => e.nome).join(', ') : ''}`
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
            <h2 className="text-2xl font-bold">{esfiha.name}</h2>
            <p className="text-red-100 text-sm mt-1">{esfiha.description}</p>
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
          {/* Tipo de Massa */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Tipo de Massa</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTipoMassa('aberta')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoMassa === 'aberta'
                    ? 'border-red-600 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🥙</div>
                  <div className="font-bold text-gray-900">Aberta</div>
                  <div className="text-xs text-gray-500 mt-1">Tradicional</div>
                </div>
              </button>

              <button
                onClick={() => setTipoMassa('fechada')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  tipoMassa === 'fechada'
                    ? 'border-red-600 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🥟</div>
                  <div className="font-bold text-gray-900">Fechada</div>
                  <div className="text-xs text-gray-500 mt-1">Estilo Pastel</div>
                </div>
              </button>
            </div>
          </div>

          {/* Acréscimos */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Acréscimos <span className="text-sm font-normal text-gray-500">(Opcional)</span>
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-gray-600">Carregando acréscimos...</p>
              </div>
            ) : availableExtras.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum acréscimo disponível</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableExtras.map((extra) => {
                  const isSelected = selectedExtras.some(e => e.id === extra.id);
                  
                  return (
                    <button
                      key={extra.id}
                      onClick={() => handleExtraToggle(extra)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{extra.nome}</div>
                          <div className="text-sm text-red-600 font-bold">
                            + R$ {extra.preco.toFixed(2)}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-red-600 border-red-600' : 'border-gray-300'
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
                  <span className="text-gray-600">{esfiha.name} ({tipoMassa})</span>
                  <span className="font-semibold">R$ {(esfiha.price || esfiha.preco).toFixed(2)}</span>
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

export default EsfihaModal;
