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

      // Sessao vencida ou invalida: derruba o login e manda para a tela de
      // entrada, em vez de deixar o painel aberto errando em silencio a cada
      // clique. 422 entra junto porque e o codigo que o flask-jwt-extended
      // devolve quando o token esta malformado.
      if (response.status === 401 || response.status === 422) {
        authService.logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
          window.location.assign('/admin/login');
        }
        return { success: false, error: 'Sessão expirada. Entre novamente.' };
      }

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
  async getAdminOrders() {
    return this.request('/pedidos/admin');
  }

  async getOrder(id) {
    return this.request(`/pedidos/${id}/`);
  }

  async updateOrderStatus(id, status) {
    // PUT /pedidos/admin/<id>/status — era PATCH /pedidos/<id>/status, que
    // nao existe nem no metodo nem no caminho.
    return this.request(`/pedidos/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Taxa de entrega: ver DeliveryCalculator.js, que usa as rotas reais
  // (/delivery/calcular-distancia-e-taxa). Havia aqui um calculateDeliveryFee
  // apontando para /delivery/calculate-fee, rota que nunca existiu, e passando
  // CEP quando o backend calcula por distancia. Ninguem chamava — e um metodo
  // que nao funciona e pior do que metodo nenhum, porque parece pronto.

  // Usuários
  async getUsers() {
    return this.request('/users/admin/users');
  }

  async getUser(id) {
    return this.request(`/users/admin/users/${id}`);
  }

  async createUser(userData) {
    // /users/register, nao /users/: a rota de criacao de usuario no backend
    // sempre foi essa. O caminho antigo caia no catch-all do React e voltava
    // 405 — "Criar usuario" no painel nunca funcionou.
    return this.request('/users/register', {
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
    try {
      const token = authService.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/print/pedido/${orderId}/imprimir`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tipo: printType }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro na requisição: ${response.status}`);
      }
      
      // Se gerou PDF, fazer download
      if (data.pdf_url && data.pdf_filename) {
        const pdfResponse = await fetch(`${API_BASE_URL}${data.pdf_url}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.pdf_filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro na requisição:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.' };
      }
      return { success: false, error: error.message };
    }
  }

  async testPrint(printType = 'pdf') {
    try {
      const token = authService.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/print/teste`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tipo: printType }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro na requisição: ${response.status}`);
      }
      
      // Se gerou PDF, fazer download
      if (data.pdf_url && data.pdf_filename) {
        const pdfResponse = await fetch(`${API_BASE_URL}${data.pdf_url}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.pdf_filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro na requisição:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.' };
      }
      return { success: false, error: error.message };
    }
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
      // /upload/image: /upload sozinho nao e rota nenhuma (405).
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
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

