import React from 'react';
import { formatarPreco } from '../utils/formato';

const PizzaCardSimple = ({ item, onImageError, onClick }) => {
  // Produto sem foto ganha um bloco discreto com a inicial, nao um vazio.
  //
  // O card apontava para https://via.placeholder.com/400x300, servico externo
  // que nao responde mais: a imagem falhava e sobrava um retangulo BRANCO de
  // 192px em cada produto sem foto. No celular isso e um terco da tela por
  // item, e o card parece quebrado. O desenho agora e local — nada a carregar,
  // nada para dar errado — e ocupa menos altura.
  const [imagemFalhou, setImagemFalhou] = React.useState(false);
  const temImagem = Boolean(item.imagem_url) && !imagemFalhou;
  const inicial = (item.name || '?').trim().charAt(0).toUpperCase();
  // Verificar se é pizza
  const isPizza = item.category && (
    item.category.toLowerCase().includes('pizza') ||
    item.category.toLowerCase().includes('pizzas')
  );

  // Verificar se é batata recheada com opções
  const isBatata = item.category && item.category.toLowerCase().includes('batata');
  const hasOptions = (item.preco_media && item.preco_grande) || (item.preco_broto && item.preco_media && item.preco_grande);

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
        {temImagem ? (
          <img
            src={item.imagem_url}
            alt={item.name}
            onError={(e) => {
              setImagemFalhou(true);
              if (onImageError) onImageError(e);
            }}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div
            className="w-full h-28 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #FDE8D7 100%)' }}
            aria-hidden="true"
          >
            <span className="text-4xl font-bold" style={{ color: jamalColors.secondary, opacity: 0.55 }}>
              {inicial}
            </span>
          </div>
        )}
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
                {formatarPreco((item.preco_broto || item.price || item.preco || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Média:</span>
              <span className="font-bold" style={{ color: jamalColors.primary }}>
                {formatarPreco((item.preco_media || item.price || item.preco || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Grande:</span>
              <span className="font-bold text-lg" style={{ color: jamalColors.primary }}>
                {formatarPreco((item.preco_grande || item.price || item.preco || 0))}
              </span>
            </div>
          </div>
        ) : isBatata && hasOptions ? (
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Pequena:</span>
              <span className="font-bold" style={{ color: jamalColors.secondary }}>
                {formatarPreco((item.preco_media || item.price || item.preco || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Grande:</span>
              <span className="font-bold text-lg" style={{ color: jamalColors.secondary }}>
                {formatarPreco((item.preco_grande || item.price || item.preco || 0))}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-2xl font-bold" style={{ color: jamalColors.primary }}>
              {formatarPreco((item.price || 0))}
            </span>
          </div>
        )}

        {/* Botão */}
        {isPizza || (isBatata && hasOptions) ? (
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
            Ver opções
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
