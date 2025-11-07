import React from 'react';

const PizzaCardSimple = ({ item, onImageError, onClick }) => {
  // Verificar se é pizza
  const isPizza = item.category && (
    item.category.toLowerCase().includes('pizza') ||
    item.category.toLowerCase().includes('pizzas')
  );

  // Cores do Jamal
  const jamalColors = {
    primary: '#DC2626',    // Vermelho
    secondary: '#F97316',  // Laranja
    accent: '#FBBF24',     // Amarelo/Dourado
    dark: '#1F2937',       // Cinza escuro
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      style={{ borderTop: `4px solid ${jamalColors.primary}` }}
    >
      {/* Imagem */}
      <div className="relative">
        <img
          src={item.imagem_url || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
          alt={item.name}
          onError={onImageError}
          className="w-full h-48 object-cover"
        />
        {/* Badge de categoria */}
        <div 
          className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: jamalColors.secondary }}
        >
          {item.category}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Nome */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {item.name}
        </h3>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
          {item.description || 'Delicioso produto preparado com ingredientes frescos'}
        </p>

        {/* Preços */}
        {isPizza ? (
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Broto:</span>
              <span className="font-bold" style={{ color: jamalColors.primary }}>
                R$ {(item.preco_broto || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Média:</span>
              <span className="font-bold" style={{ color: jamalColors.primary }}>
                R$ {(item.preco_media || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Grande:</span>
              <span className="font-bold text-lg" style={{ color: jamalColors.primary }}>
                R$ {(item.preco_grande || 0).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-2xl font-bold" style={{ color: jamalColors.primary }}>
              R$ {(item.price || 0).toFixed(2)}
            </span>
          </div>
        )}

        {/* Botão */}
        {isPizza ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(item);
            }}
            className="w-full py-3 rounded-lg font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            style={{ 
              background: `linear-gradient(135deg, ${jamalColors.secondary} 0%, ${jamalColors.primary} 100%)`
            }}
          >
            🍕 Ver Opções
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(item);
            }}
            className="w-full py-3 rounded-lg font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            style={{ backgroundColor: jamalColors.primary }}
          >
            + Adicionar
          </button>
        )}
      </div>
    </div>
  );
};

export default PizzaCardSimple;
