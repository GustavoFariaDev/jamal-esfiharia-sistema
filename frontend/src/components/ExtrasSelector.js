import React, { useState, useEffect } from 'react';

const ExtrasSelector = ({ productType, isHalfAndHalf = false, onExtrasChange, selectedExtras = [] }) => {
  const [availableExtras, setAvailableExtras] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const isPizza = productType === 'pizza';
  const isEsfiha = productType === 'esfiha';

  useEffect(() => {
    if (isPizza || isEsfiha) {
      fetchAllExtras();
    }
  }, [isPizza, isEsfiha, isHalfAndHalf]);

  useEffect(() => {
    // Definir tab inicial baseado no tipo de produto
    if (isPizza && !isHalfAndHalf) {
      setSelectedTab('pizza_toda');
    } else if (isPizza && isHalfAndHalf) {
      setSelectedTab('pizza_metade');
    } else if (isEsfiha) {
      setSelectedTab('esfiha');
    }
  }, [isPizza, isEsfiha, isHalfAndHalf]);

  const fetchAllExtras = async () => {
    try {
      setLoading(true);
      
      if (isEsfiha) {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/acrescimos?tipo=esfiha`);
        const result = await response.json();
        
        if (result.status === 'success') {
          setAvailableExtras({ esfiha: result.data || [] });
        }
      } else if (isPizza) {
        let tipos = [];
        
        if (isHalfAndHalf) {
          tipos = ['pizza_metade', 'borda'];
        } else {
          tipos = ['pizza_toda', 'borda'];
        }
        
        const extrasData = {};
        
        for (const tipo of tipos) {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/acrescimos?tipo=${tipo}`);
          const result = await response.json();
          
          if (result.status === 'success') {
            extrasData[tipo] = result.data || [];
          }
        }
        
        setAvailableExtras(extrasData);
      }
    } catch (error) {
      console.error('Erro ao buscar acréscimos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExtra = (extra) => {
    const newSelectedExtras = [...selectedExtras];
    const existingIndex = newSelectedExtras.findIndex(e => e.id === extra.id);
    
    if (existingIndex >= 0) {
      newSelectedExtras.splice(existingIndex, 1);
    } else {
      if (extra.tipo === 'borda') {
        const withoutBordas = newSelectedExtras.filter(e => e.tipo !== 'borda');
        withoutBordas.push(extra);
        onExtrasChange(withoutBordas);
        return;
      }
      newSelectedExtras.push(extra);
    }
    
    onExtrasChange(newSelectedExtras);
  };

  const isExtraSelected = (extraId) => {
    return selectedExtras.some(e => e.id === extraId);
  };

  const getTotalExtrasCount = () => {
    return selectedExtras.length;
  };

  const getTabLabel = (tipo) => {
    const labels = {
      'pizza_metade': '🍕 Por Metade',
      'pizza_toda': '🍕 Pizza Toda',
      'borda': '🟦 Borda',
      'esfiha': '🥟 Acréscimos'
    };
    return labels[tipo] || tipo;
  };

  const getTabDescription = (tipo) => {
    const descriptions = {
      'pizza_metade': 'Acréscimos por metade da pizza - R$ 7,00 cada',
      'pizza_toda': 'Acréscimos para pizza inteira - R$ 12,00 cada',
      'borda': 'Escolha uma borda recheada para sua pizza',
      'esfiha': 'Adicione ingredientes extras à sua esfiha'
    };
    return descriptions[tipo] || '';
  };

  if (!isPizza && !isEsfiha) {
    return null;
  }

  const totalCount = getTotalExtrasCount();

  console.log('ExtrasSelector Debug:', {
    productType,
    isPizza,
    isEsfiha,
    isHalfAndHalf,
    selectedTab,
    availableExtras: Object.keys(availableExtras),
    totalCount
  });

  return (
    <div className="mb-4">
      {/* CABEÇALHO - SEMPRE VISÍVEL */}
      <div className="mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 to-red-100 border-3 border-orange-400 rounded-lg hover:border-orange-500 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧀</span>
            <div className="text-left">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {isPizza ? (isHalfAndHalf ? 'Acréscimos Meio a Meio' : 'Acréscimos e Bordas') : 'Acréscimos'} 
                {totalCount > 0 && (
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {totalCount}
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-700 mt-1 font-medium">
                {isPizza 
                  ? (isHalfAndHalf 
                      ? 'Clique para adicionar extras por metade' 
                      : 'Clique para adicionar extras e bordas')
                  : 'Clique para adicionar ingredientes extras'}
              </p>
            </div>
          </div>
          <svg 
            className={`w-6 h-6 text-gray-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* CONTEÚDO EXPANSÍVEL */}
      {isExpanded && (
        <div className="border-3 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
          {/* TABS PARA PIZZA */}
          {isPizza && Object.keys(availableExtras).length > 0 && (
            <div className="flex border-b-2 border-gray-300 bg-gray-100">
              {Object.keys(availableExtras).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setSelectedTab(tipo)}
                  className={`flex-1 px-4 py-4 text-sm font-bold transition-all ${
                    selectedTab === tipo
                      ? 'bg-white text-red-600 border-b-4 border-red-600 shadow-sm'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-200'
                  }`}
                >
                  {getTabLabel(tipo)}
                </button>
              ))}
            </div>
          )}

          {/* CONTEÚDO DOS ACRÉSCIMOS */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-red-600"></div>
                <p className="mt-3 text-sm font-semibold text-gray-600">Carregando acréscimos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* DESCRIÇÃO DA TAB */}
                {selectedTab && (
                  <div className="mb-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-start gap-3">
                    <span className="text-blue-600 text-2xl">💡</span>
                    <p className="text-sm text-blue-900 leading-relaxed font-medium">
                      {getTabDescription(selectedTab)}
                      {selectedTab === 'borda' && (
                        <strong> Você pode escolher apenas uma borda por pizza.</strong>
                      )}
                    </p>
                  </div>
                )}

                {/* LISTA DE ACRÉSCIMOS PARA PIZZA */}
                {isPizza && availableExtras[selectedTab] && availableExtras[selectedTab].length > 0 ? (
                  availableExtras[selectedTab].map((extra) => (
                    <label
                      key={extra.id}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                        isExtraSelected(extra.id)
                          ? 'bg-red-100 border-3 border-red-600 shadow-lg'
                          : 'bg-gray-100 border-3 border-gray-300 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isExtraSelected(extra.id)}
                          onChange={() => toggleExtra(extra)}
                          className="w-6 h-6 text-red-600 focus:ring-red-500 rounded border-gray-400"
                        />
                        <span className="ml-4 text-base font-bold text-gray-900">{extra.nome}</span>
                      </div>
                      <span className="text-base font-bold text-red-600">
                        + R$ {extra.preco.toFixed(2)}
                      </span>
                    </label>
                  ))
                ) : isEsfiha && availableExtras.esfiha && availableExtras.esfiha.length > 0 ? (
                  availableExtras.esfiha.map((extra) => (
                    <label
                      key={extra.id}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                        isExtraSelected(extra.id)
                          ? 'bg-red-100 border-3 border-red-600 shadow-lg'
                          : 'bg-gray-100 border-3 border-gray-300 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isExtraSelected(extra.id)}
                          onChange={() => toggleExtra(extra)}
                          className="w-6 h-6 text-red-600 focus:ring-red-500 rounded border-gray-400"
                        />
                        <span className="ml-4 text-base font-bold text-gray-900">{extra.nome}</span>
                      </div>
                      <span className="text-base font-bold text-red-600">
                        + R$ {extra.preco.toFixed(2)}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500 text-base">
                    <p className="mb-2 text-lg">😔 Nenhum acréscimo disponível</p>
                    <p className="text-sm text-gray-400">Entre em contato para mais informações</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RESUMO DOS SELECIONADOS */}
          {totalCount > 0 && (
            <div className="p-4 bg-gradient-to-r from-red-100 to-orange-100 border-t-3 border-red-300">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  ✓ {totalCount} {totalCount === 1 ? 'acréscimo selecionado' : 'acréscimos selecionados'}
                </span>
                <span className="text-xl font-bold text-red-600">
                  + R$ {selectedExtras.reduce((sum, e) => sum + (e.preco || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtrasSelector;
