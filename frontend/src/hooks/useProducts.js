import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useToastContext } from '../contexts/ToastContext';

/**
 * Hook customizado para gerenciar produtos no painel admin
 * Centraliza toda a lógica de CRUD de produtos
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToastContext();

  /**
   * Busca todos os produtos da API
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.getProducts();
      
      if (result.success && result.data) {
        const productList = Array.isArray(result.data.data) ? result.data.data : [];
        setProducts(productList);
        console.log('Produtos carregados:', productList.length);
      } else {
        console.error('Erro na resposta:', result);
        error(result.error || 'Erro ao carregar produtos');
        setProducts([]);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      error('Erro de conexão ao buscar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [error]);

  /**
   * Cria um novo produto
   */
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      const result = await apiService.createProduct(productData);
      
      if (result.success) {
        success('Produto criado com sucesso!');
        await fetchProducts(); // Recarrega a lista
        return { success: true, data: result.data };
      } else {
        error(result.error || 'Erro ao criar produto');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      error('Erro de conexão ao criar produto');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [success, error, fetchProducts]);

  /**
   * Atualiza um produto existente
   */
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      setLoading(true);
      const result = await apiService.updateProduct(productId, productData);
      
      if (result.success) {
        success('Produto atualizado com sucesso!');
        await fetchProducts(); // Recarrega a lista
        return { success: true, data: result.data };
      } else {
        error(result.error || 'Erro ao atualizar produto');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      error('Erro de conexão ao atualizar produto');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [success, error, fetchProducts]);

  /**
   * Deleta um produto
   */
  const deleteProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      const result = await apiService.deleteProduct(productId);
      
      if (result.success) {
        success('Produto deletado com sucesso!');
        await fetchProducts(); // Recarrega a lista
        return { success: true };
      } else {
        error(result.error || 'Erro ao deletar produto');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      error('Erro de conexão ao deletar produto');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [success, error, fetchProducts]);

  /**
   * Faz upload de imagem do produto
   */
  const uploadProductImage = useCallback(async (file) => {
    try {
      setLoading(true);
      const result = await apiService.uploadImage(file);
      
      if (result.success) {
        success('Imagem enviada com sucesso!');
        return { success: true, url: result.data.url };
      } else {
        error(result.error || 'Erro ao enviar imagem');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      error('Erro de conexão ao enviar imagem');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  // Carrega produtos ao montar o componente
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
  };
};

export default useProducts;
