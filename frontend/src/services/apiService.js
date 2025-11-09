import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta do servidor não é JSON');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro na requisição: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro na requisição:', error);
      // Se for erro de rede, mostrar mensagem mais específica
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.' };
      }
      return { success: false, error: error.message };
    }
  }

  // Produtos/Esfihas
  async getProducts(filters = {}) {
    // Adicionar per_page para retornar mais produtos (padrão é 50)
    const defaultFilters = { per_page: 500, ...filters };
    
    // Remover parâmetros undefined ou vazios
    Object.keys(defaultFilters).forEach(key => {
      if (defaultFilters[key] === undefined || defaultFilters[key] === null || defaultFilters[key] === '') {
        delete defaultFilters[key];
      }
    });
    
    const params = new URLSearchParams(defaultFilters);
    return this.request(`/esfihas/?${params}`);
  }

  async getProduct(id) {
    return this.request(`/esfihas/${id}`);
  }

  async createProduct(productData) {
    return this.request('/esfihas/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    console.log(`[API] updateProduct - ID: ${id}`);
    console.log('[API] productData:', productData);
    const result = await this.request(`/esfihas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    console.log('[API] updateProduct result:', result);
    return result;
  }

  async deleteProduct(id) {
    return this.request(`/esfihas/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleProductAvailability(id) {
    return this.request(`/esfihas/${id}/toggle-disponibilidade`, {
      method: 'PATCH',
    });
  }

  // Categorias
  async getCategories() {
    return this.request('/categories/');
  }

  // Pedidos
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/pedidos/?${params}`);
  }

  async getAdminOrders() {
    return this.request('/pedidos/admin');
  }

  async getOrder(id) {
    return this.request(`/pedidos/${id}/`);
  }

  async createOrder(orderData) {
    return this.request('/pedidos/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Taxa de entrega
  async calculateDeliveryFee(cep) {
    return this.request('/delivery/calculate-fee', {
      method: 'POST',
      body: JSON.stringify({ cep }),
    });
  }

  // Usuários
  async getUsers() {
    return this.request('/users/admin/users');
  }

  async getUser(id) {
    return this.request(`/users/admin/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Clientes
  async getClientes(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/clientes/?${params}`);
  }

  async getCliente(id) {
    return this.request(`/clientes/${id}`);
  }

  async createCliente(clienteData) {
    return this.request('/clientes/', {
      method: 'POST',
      body: JSON.stringify(clienteData),
    });
  }

  async updateCliente(id, clienteData) {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clienteData),
    });
  }

  async deleteCliente(id) {
    return this.request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Impressão
  async getPrinters() {
    return this.request('/print/impressoras');
  }

  async printOrder(orderId, printType = 'pdf') {
    return this.request(`/print/pedido/${orderId}/imprimir`, {
      method: 'POST',
      body: JSON.stringify({ tipo: printType }),
    });
  }

  async testPrint(printType = 'pdf') {
    return this.request('/print/teste', {
      method: 'POST',
      body: JSON.stringify({ tipo: printType }),
    });
  }

  // Upload de imagens
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = authService.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no upload');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro no upload:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ApiService();

