import { useState, useMemo } from 'react';

/**
 * Hook customizado para gerenciar busca e filtros de produtos
 * Centraliza a lógica de filtragem do cardápio
 */
export const useProductFilter = (products) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  /**
   * Filtra produtos baseado em busca e categoria
   * Usa useMemo para otimizar performance
   */
  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.nome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const isAvailable = item.disponivel !== false;
      
      return matchesSearch && matchesCategory && isAvailable;
    });
  }, [products, searchTerm, selectedCategory]);

  /**
   * Filtra apenas pizzas (para seletor meio a meio)
   */
  const pizzaProducts = useMemo(() => {
    return products.filter(item => {
      const category = item.category?.toLowerCase() || '';
      return (category.includes('pizza') || category.includes('pizzas')) && item.disponivel !== false;
    });
  }, [products]);

  /**
   * Reseta todos os filtros
   */
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    pizzaProducts,
    resetFilters
  };
};

export default useProductFilter;
