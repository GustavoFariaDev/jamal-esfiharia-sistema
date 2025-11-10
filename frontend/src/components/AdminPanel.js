import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Package, ShoppingBag, LogOut, X, Check, ChevronDown, ChevronUp, Grid, List, Users, Printer, BarChart3, User, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import authService from '../services/authService';
import { useToastContext } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';
import RestaurantStatusControl from '../pages/admin/RestaurantStatusControl';
import OrderManagement from './OrderManagement';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCliente, setEditingCliente] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [expandedCategories, setExpandedCategories] = useState({});
  const navigate = useNavigate();
  const { success, error, warning, info } = useToastContext();

  const [productForm, setProductForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    disponivel: true,
    imagem_url: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [clienteForm, setClienteForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    cidade: '',
    observacoes: ''
  });

  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    is_admin: false
  });

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      navigate('/admin/login');
      return;
    }
    
    fetchProducts();
    fetchOrders();
    fetchCategories();
    fetchUsers();
    fetchClientes();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await apiService.getProducts();
      if (result.success && result.data) {
        // A API retorna { status: 'success', data: [...], pagination: {...} }
        const products = Array.isArray(result.data.data) ? result.data.data : [];
        setProducts(products);
        console.log('Produtos carregados:', products.length);
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
  };

  const fetchOrders = async () => {
    try {
      const result = await apiService.getAdminOrders();
      if (result.success && result.data) {
        setOrders(result.data.data || []);
      } else {
        console.error('Erro ao buscar pedidos:', result.error);
        error(result.error || 'Erro ao carregar pedidos');
        setOrders([]);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      error('Erro de conexão ao buscar pedidos');
      setOrders([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await apiService.getCategories();
      if (result.success && result.data) {
        // A API retorna { status: 'success', data: [...] }
        const cats = Array.isArray(result.data.data) ? result.data.data : [];
        setCategories(cats);
        console.log('Categorias carregadas:', cats.length);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setCategories([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await apiService.getUsers();
      if (result.success && result.data) {
        setUsers(result.data.data || []);
      } else {
        console.error('Erro ao buscar usuários:', result.error);
        error(result.error || 'Erro ao carregar usuários');
        setUsers([]);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      error('Erro de conexão ao buscar usuários');
      setUsers([]);
    }
  };

  const fetchClientes = async () => {
    try {
      const result = await apiService.getClientes();
      if (result.success && result.data) {
        setClientes(result.data.data || []);
      } else {
        console.error('Erro ao buscar clientes:', result.error);
        error(result.error || 'Erro ao carregar clientes');
        setClientes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      error('Erro de conexão ao buscar clientes');
      setClientes([]);
    }
  };

  const fetchPrinters = async () => {
    try {
      const result = await apiService.getPrinters();
      if (result.success && result.data) {
        setPrinters(result.data.impressoras || []);
      } else {
        console.error('Erro ao buscar impressoras:', result.error);
        error(result.error || 'Erro ao carregar impressoras');
        setPrinters([]);
      }
    } catch (err) {
      console.error('Erro ao buscar impressoras:', err);
      error('Erro de conexão ao buscar impressoras');
      setPrinters([]);
    }
  };

  const handlePrintOrder = async (orderId, tipo = 'thermal') => {
    try {
      setLoading(true);
      const result = await apiService.printOrder(orderId, tipo);
      
      if (result.success) {
        success('Impressão realizada com sucesso!');
        if (result.data.pdf_url) {
          window.open(result.data.pdf_url, '_blank');
        }
      } else {
        error(result.error || 'Erro ao imprimir pedido');
      }
    } catch (err) {
      console.error('Erro ao imprimir pedido:', err);
      error('Erro de conexão ao imprimir');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async (tipo = 'thermal') => {
    try {
      setLoading(true);
      const result = await apiService.testPrint(tipo);
      
      if (result.success) {
        success('Teste de impressão realizado com sucesso!');
        if (result.data.pdf_url) {
          window.open(result.data.pdf_url, '_blank');
        }
      } else {
        error(result.error || 'Erro ao testar impressão');
      }
    } catch (err) {
      console.error('Erro ao testar impressão:', err);
      error('Erro de conexão ao testar impressão');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    success('Logout realizado com sucesso!');
    navigate('/admin/login');
  };

  const openProductModal = (product = null) => {
    console.log('=== openProductModal chamado ===');
    console.log('product recebido:', product);
    
    if (product) {
      console.log('Modo: EDIÇÃO');
      setEditingProduct(product);
      const formData = {
        nome: product.nome,
        descricao: product.descricao,
        preco: product.preco,
        categoria: product.categoria,
        disponivel: product.disponivel,
        imagem_url: product.imagem_url || ''
      };
      console.log('formData setado:', formData);
      console.log('🖼️ Imagem atual do produto:', product.imagem_url);
      setProductForm(formData);
      setImagePreview(product.imagem_url || null);
    } else {
      console.log('Modo: CRIAÇÃO');
      setEditingProduct(null);
      setProductForm({
        nome: '',
        descricao: '',
        preco: '',
        categoria: '',
        disponivel: true,
        imagem_url: ''
      });
      setImagePreview(null);
    }
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({
      nome: '',
      descricao: '',
      preco: '',
      categoria: '',
      disponivel: true,
      imagem_url: ''
    });
    setImagePreview(null);
    setSelectedImageFile(null);
    setUploadingImage(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('=== INÍCIO handleImageUpload ===');
    console.log('Arquivo selecionado:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      error('Tipo de arquivo não permitido. Use PNG, JPG, JPEG, GIF ou WEBP');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    // Armazenar o arquivo selecionado para fazer upload no handleSaveProduct
    setSelectedImageFile(file);

    // Criar preview local apenas para visualização
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    console.log('Arquivo armazenado para upload posterior');
    console.log('=== FIM handleImageUpload ===');
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    // Usar setState funcional para garantir que sempre use o estado mais recente
    setProductForm(prevForm => ({ ...prevForm, imagem_url: '' }));
  };

  const handleSaveProduct = async () => {
    console.log('=== INÍCIO handleSaveProduct ===');
    console.log('editingProduct:', editingProduct);
    console.log('productForm:', productForm);
    console.log('selectedImageFile:', selectedImageFile);

    if (!productForm.nome || !productForm.preco || !productForm.categoria) {
      console.warn('Validação falhou: campos obrigatórios vazios');
      warning('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      // SOLUÇÃO DEFINITIVA:
      // Fazer o upload da imagem DENTRO do handleSaveProduct, antes de salvar o produto.
      // Isso garante que a URL do Cloudinary seja usada, não o base64.

      let finalImageUrl = productForm.imagem_url;

      // Se o usuário selecionou um novo arquivo, fazer upload agora
      if (selectedImageFile) {
        console.log('📤 Fazendo upload da imagem antes de salvar...');
        setUploadingImage(true);

        try {
          const formData = new FormData();
          formData.append('file', selectedImageFile);

          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL || '/api'}/upload/image`,
            {
              method: 'POST',
              body: formData
            }
          );

          const result = await response.json();
          console.log('Resposta do upload:', result);

          if (result.status === 'success') {
            finalImageUrl = result.data.url;
            console.log('✅ Upload bem-sucedido! URL:', finalImageUrl);
          } else {
            throw new Error(result.message || 'Erro ao fazer upload da imagem');
          }
        } catch (uploadErr) {
          console.error('❌ Erro ao fazer upload:', uploadErr);
          error('Erro ao fazer upload da imagem: ' + uploadErr.message);
          setUploadingImage(false);
          setLoading(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Preparar dados do produto com a URL final da imagem
      const productData = {
        ...productForm,
        imagem_url: finalImageUrl,
        preco: parseFloat(productForm.preco)
      };

      console.log('productData preparado:', productData);
      console.log('🖼️ URL da imagem que será enviada:', productData.imagem_url);

      let result;
      if (editingProduct) {
        console.log('Modo: EDICAO - ID:', editingProduct.id);
        result = await apiService.updateProduct(editingProduct.id, productData);
      } else {
        console.log('Modo: CRIACAO');
        result = await apiService.createProduct(productData);
      }

      console.log('Resultado da API:', result);

      if (result.success) {
        success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
        closeProductModal();
        fetchProducts();
      } else {
        console.error('Erro retornado pela API:', result.error);
        error(result.error || 'Erro ao salvar produto');
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      error('Erro de conexão ao salvar produto');
    } finally {
      setLoading(false);
      console.log('=== FIM handleSaveProduct ===');
    }
  };

  const confirmDeleteProduct = (productId) => {
    setDeletingProductId(productId);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;

    try {
      setLoading(true);
      const result = await apiService.deleteProduct(deletingProductId);
      
      if (result.success) {
        success('Produto excluído com sucesso!');
        fetchProducts();
      } else {
        error(result.error || 'Erro ao excluir produto');
      }
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      error('Erro de conexão ao excluir produto');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeletingProductId(null);
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      const result = await apiService.toggleProductAvailability(productId);
      
      if (result.success) {
        success(currentStatus ? 'Produto marcado como indisponível' : 'Produto marcado como disponível');
        fetchProducts();
      } else {
        error(result.error || 'Erro ao atualizar disponibilidade');
      }
    } catch (err) {
      console.error('Erro ao atualizar disponibilidade:', err);
      error('Erro de conexão');
    }
  };

  // Funções para Clientes
  const openClienteModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setClienteForm({
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        endereco: cliente.endereco || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        observacoes: cliente.observacoes || ''
      });
    } else {
      setEditingCliente(null);
      setClienteForm({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        bairro: '',
        cidade: '',
        observacoes: ''
      });
    }
    setShowClienteModal(true);
  };

  const closeClienteModal = () => {
    setShowClienteModal(false);
    setEditingCliente(null);
    setClienteForm({
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      bairro: '',
      cidade: '',
      observacoes: ''
    });
  };

  const handleSaveCliente = async () => {
    if (!clienteForm.nome || !clienteForm.telefone) {
      warning('Preencha nome e telefone');
      return;
    }

    try {
      setLoading(true);
      
      const result = editingCliente
        ? await apiService.updateCliente(editingCliente.id, clienteForm)
        : await apiService.createCliente(clienteForm);
      
      if (result.success) {
        success(editingCliente ? 'Cliente atualizado!' : 'Cliente cadastrado!');
        closeClienteModal();
        fetchClientes();
      } else {
        error(result.error || 'Erro ao salvar cliente');
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      error('Erro de conexão ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  // Funções para Usuários
  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username || '',
        password: '',
        email: user.email || '',
        is_admin: user.is_admin || false
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        password: '',
        email: '',
        is_admin: false
      });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      email: '',
      is_admin: false
    });
  };

  const handleSaveUser = async () => {
    if (!userForm.username || (!editingUser && !userForm.password)) {
      warning('Preencha username e senha');
      return;
    }

    try {
      setLoading(true);
      
      const result = editingUser
        ? await apiService.updateUser(editingUser.id, userForm)
        : await apiService.createUser(userForm);
      
      if (result.success) {
        success(editingUser ? 'Usuário atualizado!' : 'Usuário criado!');
        closeUserModal();
        fetchUsers();
      } else {
        error(result.error || 'Erro ao salvar usuário');
      }
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      error('Erro de conexão ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas para Dashboard
  const getStats = () => {
    const totalProdutos = products.length;
    const produtosDisponiveis = products.filter(p => p.disponivel).length;
    const totalPedidos = orders.length;
    const totalClientes = clientes.length;
    const pedidosPendentes = orders.filter(o => o.status === 'pendente').length;
    const valorTotal = orders.reduce((sum, o) => sum + (o.valor_total || 0), 0);

    return {
      totalProdutos,
      produtosDisponiveis,
      totalPedidos,
      totalClientes,
      pedidosPendentes,
      valorTotal
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Package className="w-5 h-5" />
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ShoppingBag className="w-5 h-5" />
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`${
                activeTab === 'clientes'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Users className="w-5 h-5" />
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <User className="w-5 h-5" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`${
                activeTab === 'status'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Eye className="w-5 h-5" />
              Status da Loja
            </button>
            <button
              onClick={() => {
                setActiveTab('impressao');
                fetchPrinters();
              }}
              className={`${
                activeTab === 'impressao'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Printer className="w-5 h-5" />
              Impressão
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8 pb-12">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Produtos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalProdutos}</p>
                      <p className="text-xs text-green-600 mt-1">{stats.produtosDisponiveis} disponíveis</p>
                    </div>
                    <Package className="w-12 h-12 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Pedidos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalPedidos}</p>
                      <p className="text-xs text-yellow-600 mt-1">{stats.pedidosPendentes} pendentes</p>
                    </div>
                    <ShoppingBag className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Clientes</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalClientes}</p>
                      <p className="text-xs text-gray-500 mt-1">cadastrados</p>
                    </div>
                    <Users className="w-12 h-12 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total de Pedidos</p>
                      <p className="text-3xl font-bold text-green-600">R$ {stats.valorTotal.toFixed(2)}</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Pedidos</h3>
                {orders.slice(0, 5).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum pedido recente</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">#{order.numero_pedido}</p>
                          <p className="text-sm text-gray-600">{order.nome_cliente}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {order.valor_total?.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Produtos */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-red-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Visualização em Lista"
                    >
                      <List className="w-4 h-4" />
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                        viewMode === 'grouped'
                          ? 'bg-white text-red-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Visualização Agrupada por Categoria"
                    >
                      <Grid className="w-4 h-4" />
                      Agrupada
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => openProductModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Novo Produto
                </button>
              </div>

              {viewMode === 'list' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="all">Todas as Categorias</option>
                      {categories.filter(c => c.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {products
                      .filter(p => selectedCategoryFilter === 'all' || (p.categoria && p.categoria.toLowerCase() === selectedCategoryFilter.toLowerCase()))
                      .map((product) => (
                        <div key={product.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex-shrink-0">
                                {product.imagem_url ? (
                                  <img
                                    className="h-16 w-16 rounded-lg object-cover"
                                    src={product.imagem_url}
                                    alt={product.nome}
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {product.nome}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {product.descricao?.substring(0, 80)}{product.descricao?.length > 80 ? '...' : ''}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-lg font-bold text-red-600">
                                    R$ {product.preco.toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => handleToggleAvailability(product.id, product.disponivel)}
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      product.disponivel
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {product.disponivel ? 'Disponível' : 'Indisponível'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openProductModal(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => confirmDeleteProduct(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {viewMode === 'grouped' && (
                <div className="space-y-4">
                  {categories
                    .filter(cat => cat.id !== 'all')
                    .map((category) => {
                      const categoryProducts = products.filter(p => p.categoria && p.categoria.toLowerCase() === category.id.toLowerCase());
                      const isExpanded = expandedCategories[category.id];

                      return (
                        <div key={category.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedCategories({
                              ...expandedCategories,
                              [category.id]: !isExpanded
                            })}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                                {categoryProducts.length}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="divide-y divide-gray-200">
                              {categoryProducts.map((product) => (
                                <div key={product.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex-shrink-0">
                                        {product.imagem_url ? (
                                          <img
                                            className="h-16 w-16 rounded-lg object-cover"
                                            src={product.imagem_url}
                                            alt={product.nome}
                                          />
                                        ) : (
                                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-400" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                          {product.nome}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                          {product.descricao?.substring(0, 80)}{product.descricao?.length > 80 ? '...' : ''}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                          <span className="text-lg font-bold text-red-600">
                                            R$ {product.preco.toFixed(2)}
                                          </span>
                                          <button
                                            onClick={() => handleToggleAvailability(product.id, product.disponivel)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                              product.disponivel
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                          >
                                            {product.disponivel ? 'Disponível' : 'Indisponível'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openProductModal(product)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                      >
                                        <Edit className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => confirmDeleteProduct(product.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Pedidos */}
          {activeTab === 'orders' && (
            <OrderManagement />
          )}

          {/* Clientes */}
          {activeTab === 'clientes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h2>
                <button
                  onClick={() => openClienteModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Novo Cliente
                </button>
              </div>

              {clientes.length === 0 ? (
                <div className="bg-white shadow sm:rounded-lg p-8 text-center">
                  <p className="text-gray-500">Nenhum cliente cadastrado</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telefone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Endereço
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cliente.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cliente.telefone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cliente.email || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {cliente.endereco ? `${cliente.endereco}, ${cliente.bairro || ''}, ${cliente.cidade || ''}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => openClienteModal(cliente)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Usuários */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
                <button
                  onClick={() => openUserModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Novo Usuário
                </button>
              </div>

              {users.length === 0 ? (
                <div className="bg-white shadow sm:rounded-lg p-8 text-center">
                  <p className="text-gray-500">Nenhum usuário cadastrado</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.is_admin ? 'Sim' : 'Não'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => openUserModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Status da Loja */}
          {activeTab === 'status' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Controle do Restaurante</h2>
              <RestaurantStatusControl />
            </div>
          )}

          {/* Impressão */}
          {activeTab === 'impressao' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sistema de Impressão</h2>
              
              <div className="space-y-6">
                {/* Teste de Impressão */}
                <div className="bg-white shadow sm:rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teste de Impressão</h3>
                  <p className="text-gray-600 mb-4">Use esta seção para testar a impressão sem precisar de um pedido real.</p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTestPrint('thermal')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Printer className="w-5 h-5" />
                      Teste Impressão Térmica
                    </button>
                    <button
                      onClick={() => handleTestPrint('pdf')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      📄 Teste PDF
                    </button>
                    <button
                      onClick={() => handleTestPrint('both')}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      🖨️📄 Ambos
                    </button>
                  </div>
                </div>

                {/* Impressoras Disponíveis */}
                <div className="bg-white shadow sm:rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Impressoras Disponíveis</h3>
                    <button
                      onClick={fetchPrinters}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      🔄 Atualizar Lista
                    </button>
                  </div>
                  
                  {printers.length === 0 ? (
                    <p className="text-gray-500">Nenhuma impressora encontrada</p>
                  ) : (
                    <ul className="space-y-2">
                      {printers.map((printer, index) => (
                        <li key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">{printer}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Informações */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Informações</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• A impressão térmica envia direto para a impressora configurada</li>
                    <li>• A geração de PDF cria um arquivo para download</li>
                    <li>• Você pode imprimir pedidos diretamente na aba "Pedidos"</li>
                    <li>• Configure a impressora padrão nas configurações do sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Produto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={closeProductModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={productForm.nome}
                  onChange={(e) => setProductForm({ ...productForm, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Nome do produto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={productForm.descricao}
                  onChange={(e) => setProductForm({ ...productForm, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Descrição do produto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.preco}
                    onChange={(e) => setProductForm({ ...productForm, preco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={productForm.categoria}
                    onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {categories.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seção de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Produto
                </label>
                
                {/* Preview da Imagem */}
                {imagePreview && (
                  <div className="mb-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Remover imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Botões de Upload */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {uploadingImage ? 'Enviando...' : 'Fazer Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Digite a URL da imagem:');
                      if (url) {
                        setProductForm({ ...productForm, imagem_url: url });
                        setImagePreview(url);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">URL da Imagem</span>
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Formatos aceitos: PNG, JPG, JPEG, GIF, WEBP (máx. 5MB)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disponivel"
                  checked={productForm.disponivel}
                  onChange={(e) => setProductForm({ ...productForm, disponivel: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-300 rounded"
                />
                <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">
                  Produto disponível
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeProductModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cliente */}
      {showClienteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={closeClienteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={clienteForm.nome}
                    onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={clienteForm.telefone}
                    onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={clienteForm.email}
                  onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={clienteForm.endereco}
                  onChange={(e) => setClienteForm({ ...clienteForm, endereco: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Rua, número"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={clienteForm.bairro}
                    onChange={(e) => setClienteForm({ ...clienteForm, bairro: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Bairro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={clienteForm.cidade}
                    onChange={(e) => setClienteForm({ ...clienteForm, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Cidade"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={clienteForm.observacoes}
                  onChange={(e) => setClienteForm({ ...clienteForm, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Observações sobre o cliente"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeClienteModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCliente}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Usuário */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={userForm.is_admin}
                  onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-300 rounded"
                />
                <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-900">
                  Usuário administrador
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={closeUserModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingProductId(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Excluir Produto"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default AdminPanel;
