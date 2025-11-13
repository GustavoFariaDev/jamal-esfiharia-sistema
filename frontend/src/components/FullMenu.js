import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Plus, Minus, X, Trash2 } from "lucide-react";
import DeliveryCalculator from './DeliveryCalculator';
import ConfirmModal from './ConfirmModal';
import RestaurantStatusBanner from './RestaurantStatusBanner';
import PizzaCard from './PizzaCard';
import PizzaCardSimple from './PizzaCardSimple';
import HalfAndHalfSelector from './HalfAndHalfSelector';
import PizzaModal from './PizzaModal';
import EsfihaModal from './EsfihaModal'; // ✅ NOVO: Importar EsfihaModal
import GenericProductModal from './GenericProductModal'; // ✅ NOVO: Importar GenericProductModal
import BeiruteModal from './BeiruteModal'; // ✅ NOVO: Importar BeiruteModal
import apiService from '../services/apiService';
import { useToastContext } from '../contexts/ToastContext';

const FullMenu = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryType, setDeliveryType] = useState('entrega'); // 'entrega' ou 'retirada'
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHalfAndHalf, setShowHalfAndHalf] = useState(false);
  const [halfAndHalfData, setHalfAndHalfData] = useState({ item: null, size: 'grande' });
  const [showPizzaModal, setShowPizzaModal] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState(null);
  
  // ✅ NOVO: Estados para EsfihaModal
  const [showEsfihaModal, setShowEsfihaModal] = useState(false);
  const [selectedEsfiha, setSelectedEsfiha] = useState(null);
  
  // ✅ NOVO: Estados para GenericProductModal
  const [showGenericModal, setShowGenericModal] = useState(false);
  const [selectedGenericProduct, setSelectedGenericProduct] = useState(null);
  
  // ✅ NOVO: Estados para BeiruteModal
  const [showBeiruteModal, setShowBeiruteModal] = useState(false);
  const [selectedBeirute, setSelectedBeirute] = useState(null);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    complement: '',
    cep: '',
    observations: '',
    changeFor: null,
    paymentMethod: 'dinheiro'
  });
  const [customerHistory, setCustomerHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // ✅ NOVO: Estado para status da loja
  const [restaurantStatus, setRestaurantStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Sistema de notificações
  const { success, error, warning, info } = useToastContext();

  // ✅ NOVO: Carregar status do restaurante
  const fetchRestaurantStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || '/api'}/configuracao/status`);
      if (response.ok) {
        const data = await response.json();
        setRestaurantStatus(data);
      }
    } catch (err) {
      console.error('Erro ao carregar status do restaurante:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Buscar produtos, categorias e status da API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchRestaurantStatus();
    
    // Atualizar status a cada 1 minuto
    const interval = setInterval(fetchRestaurantStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await apiService.getProducts();
      
      if (result.success && result.data) {
        // A API retorna { status: 'success', data: [...], pagination: {...} }
        const products = Array.isArray(result.data.data) ? result.data.data : [];
        const formattedItems = products.map(item => ({
          id: item.id,
          name: item.nome,
          nome: item.nome,
          price: item.preco,
          preco_grande: item.preco_grande,
          preco_media: item.preco_media,
          preco_broto: item.preco_broto,
          category: item.categoria ? item.categoria.toLowerCase() : '',
          description: item.descricao || '',
          imagem_url: item.imagem_url || '',
          disponivel: item.disponivel !== false
        }));
        setMenuItems(formattedItems);
        console.log('Produtos carregados no menu:', formattedItems.length);
      } else {
        console.error('Erro na resposta:', result);
        error(result.error || 'Erro ao carregar produtos');
        setMenuItems([]);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      error('Erro de conexão com o servidor');
      setMenuItems([]);
    } finally {
      setLoading(false);
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

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.disponivel;
  });

  // Filtrar apenas pizzas para o seletor meio a meio
  const pizzaItems = menuItems.filter(item => {
    const category = item.category.toLowerCase();
    return (category.includes('pizza') && item.disponivel);
  });

  const addToCart = (item) => {
    setCart(prevCart => {
      // Para pizzas meio a meio, verificar se já existe item idêntico
      if (item.isHalfAndHalf) {
        // Tentar encontrar item idêntico no carrinho
        const existingItem = prevCart.find(cartItem => 
          cartItem.isHalfAndHalf &&
          cartItem.firstHalf?.id === item.firstHalf?.id &&
          cartItem.secondHalf?.id === item.secondHalf?.id &&
          cartItem.selectedSize === item.selectedSize &&
          JSON.stringify(cartItem.firstHalfExtras || []) === JSON.stringify(item.firstHalfExtras || []) &&
          JSON.stringify(cartItem.secondHalfExtras || []) === JSON.stringify(item.secondHalfExtras || []) &&
          cartItem.selectedBorda?.id === item.selectedBorda?.id
        );
        
        // Se encontrou item idêntico, incrementar quantidade
        if (existingItem) {
          success(`Quantidade de ${item.customName || item.name} aumentada!`);
          return prevCart.map(cartItem =>
            cartItem.cartId === existingItem.cartId
              ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
              : cartItem
          );
        }
        
        // Se não encontrou, adicionar como novo item
        const newItem = {
          ...item,
          quantity: item.quantity || 1,
          cartId: item.cartId || `cart-half-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        success(`${item.customName || item.name} adicionado ao carrinho!`);
        return [...prevCart, newItem];
      }
      
      // Para itens normais, verificar se já existe no carrinho
      const existingItem = prevCart.find(cartItem => 
        cartItem.id === item.id && 
        cartItem.name === item.name &&
        !cartItem.isHalfAndHalf &&
        cartItem.selectedSize === item.selectedSize && // ✅ Comparar tamanho (para pizzas)
        cartItem.tipoMassa === item.tipoMassa && // ✅ Comparar tipo de massa
        JSON.stringify(cartItem.selectedExtras || []) === JSON.stringify(item.selectedExtras || []) && // ✅ Comparar extras de pizzas
        JSON.stringify(cartItem.extras || []) === JSON.stringify(item.extras || []) // ✅ Comparar acréscimos de esfihas
      );
      
      if (existingItem) {
        success(`Quantidade de ${item.customName || item.name} aumentada!`);
        return prevCart.map(cartItem =>
          cartItem.cartId === existingItem.cartId
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        );
      }
      
      // Adicionar novo item com ID único para o carrinho
      const newItem = { 
        ...item, 
        quantity: item.quantity || 1,
        cartId: item.cartId || `cart-${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      success(`${item.customName || item.name} adicionado ao carrinho!`);
      return [...prevCart, newItem];
    });
  };

  const handleHalfAndHalfClick = (item, size) => {
    setHalfAndHalfData({ item, size });
    setShowHalfAndHalf(true);
  };

  const handleHalfAndHalfConfirm = (data) => {
    const { firstHalf, secondHalf, price, firstHalfExtras = [], secondHalfExtras = [], selectedBorda = null } = data;
    
    const getSizeLabel = () => {
      const labels = {
        'grande': 'Grande',
        'media': 'Média',
        'broto': 'Broto'
      };
      return labels[halfAndHalfData.size] || 'Grande';
    };

    // Construir nome detalhado do item
    let itemName = `Pizza Meio a Meio (${getSizeLabel()}): ${firstHalf.name} / ${secondHalf.name}`;
    
    // Adicionar acréscimos da primeira metade
    if (firstHalfExtras.length > 0) {
      const extrasNames = firstHalfExtras.map(e => e.nome).join(', ');
      itemName += ` | Metade A + ${extrasNames}`;
    }
    
    // Adicionar acréscimos da segunda metade
    if (secondHalfExtras.length > 0) {
      const extrasNames = secondHalfExtras.map(e => e.nome).join(', ');
      itemName += ` | Metade B + ${extrasNames}`;
    }
    
    // Adicionar borda
    if (selectedBorda) {
      itemName += ` | Borda: ${selectedBorda.nome}`;
    }

    const halfAndHalfItem = {
      id: `half-${firstHalf.id}-${secondHalf.id}-${Date.now()}`,
      cartId: `cart-half-${firstHalf.id}-${secondHalf.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: itemName,
      price: price,
      category: firstHalf.category,
      description: `Metade ${firstHalf.name}, Metade ${secondHalf.name}`,
      imagem_url: firstHalf.imagem_url,
      isHalfAndHalf: true,
      firstHalf: firstHalf,
      secondHalf: secondHalf,
      selectedSize: halfAndHalfData.size,
      firstHalfExtras: firstHalfExtras,
      secondHalfExtras: secondHalfExtras,
      selectedBorda: selectedBorda,
      quantity: 1
    };

    setCart(prevCart => [...prevCart, halfAndHalfItem]);
    success('Pizza meio a meio adicionada ao carrinho!');
    setShowHalfAndHalf(false);
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.cartId === cartId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.cartId !== cartId);
    });
  };

  const deleteFromCart = (cartId) => {
    const item = cart.find(i => i.cartId === cartId);
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
    if (item) {
      info(`${item.customName || item.name} removido do carrinho`);
    }
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryInfo(null);
    setCustomerInfo({
      name: '',
      phone: '',
      address: '',
      complement: '',
      cep: '',
      observations: '',
      changeFor: null,
      paymentMethod: 'dinheiro'
    });
    info('Carrinho limpo');
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const deliveryFee = deliveryInfo ? deliveryInfo.fee : 0;
    return subtotal + deliveryFee;
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleDeliveryFeeCalculated = (info) => {
    setDeliveryInfo(info);
    
    // Atualiza o endereço e CEP no formulário do cliente
    setCustomerInfo(prev => ({
      ...prev,
      address: info.address,
      cep: info.cep
    }));
    
    success('Taxa de entrega calculada! Endereço preenchido automaticamente.');
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const buscarHistoricoCliente = async (telefone) => {
    // Limpar telefone (remover caracteres especiais)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    // Só buscar se tiver pelo menos 10 dígitos
    if (telefoneLimpo.length < 10) {
      setCustomerHistory(null);
      return;
    }

    try {
      setIsLoadingHistory(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/clientes/buscar/${telefoneLimpo}`
      );
      const data = await response.json();
      
      if (data.status === 'success' && data.data.encontrado) {
        setCustomerHistory(data.data);
        // Preencher automaticamente os campos
        setCustomerInfo(prev => ({
          ...prev,
          name: data.data.nome || prev.name,
          address: data.data.endereco || prev.address
        }));
        info(`Cliente encontrado! ${data.data.total_pedidos} pedido(s) anterior(es).`);
      } else {
        setCustomerHistory(null);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setCustomerHistory(null);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const validateCheckout = () => {
    if (cart.length === 0) {
      warning('Seu carrinho está vazio!');
      return false;
    }

    if (!customerInfo.name.trim()) {
      warning('Por favor, informe seu nome');
      return false;
    }

    if (!customerInfo.phone.trim()) {
      warning('Por favor, informe seu telefone');
      return false;
    }

    // Validações específicas para entrega
    if (deliveryType === 'entrega') {
      if (!customerInfo.address.trim()) {
        warning('Por favor, informe seu endereço');
        return false;
      }

      if (!deliveryInfo) {
        warning('Por favor, calcule a taxa de entrega');
        return false;
      }
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateCheckout()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    try {
      setIsProcessing(true);
      info('Processando pedido...');

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos-simples`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_cliente: customerInfo.name,
          telefone: customerInfo.phone,
          endereco: customerInfo.address || '',
          complemento: customerInfo.complement || '',
          cep_entrega: customerInfo.cep || '',
          forma_entrega: deliveryType,
          taxa_entrega: deliveryInfo?.fee || 0,
          distancia_km: deliveryInfo?.distance || null,
          forma_pagamento: customerInfo.paymentMethod || 'dinheiro',
          troco_para: customerInfo.changeFor || null,
          observacoes: customerInfo.observations || '',
          itens: cart.map(item => {
            // Se for pizza meio a meio, usar os IDs das metades
            if (item.isHalfAndHalf) {
              return {
                esfiha_id: item.firstHalf?.id,
                quantidade: item.quantity,
                preco_unitario: item.price,
                observacoes: item.observacoes || '',
                eh_meio_a_meio: true,
                esfiha_id_metade2: item.secondHalf?.id,
                tamanho: item.selectedSize || null,
                acrescimos: [
                  ...(item.firstHalfExtras || []).map(extra => ({
                    acrescimo_id: extra.id,
                    quantidade: 1
                  })),
                  ...(item.secondHalfExtras || []).map(extra => ({
                    acrescimo_id: extra.id,
                    quantidade: 1
                  })),
                  ...(item.selectedBorda ? [{
                    acrescimo_id: item.selectedBorda.id,
                    quantidade: 1
                  }] : [])
                ]
              };
            }
            
            // Para itens normais
            return {
              esfiha_id: item.id,
              quantidade: item.quantity,
              preco_unitario: item.price,
              observacoes: item.observacoes || '',
              eh_meio_a_meio: false,
              esfiha_id_metade2: null,
              tamanho: item.selectedSize || null,
              acrescimos: (item.extras || []).map(extra => ({
                acrescimo_id: extra.id,
                quantidade: 1
              }))
            };
          })
        })
      });

      const result = await response.json();
      
      // Debug: verificar resposta
      console.log('Resposta do servidor:', result);
      console.log('Link do WhatsApp:', result.whatsapp_link);

      if (response.ok && result.status === 'success') {
        success(
          'Pedido realizado com sucesso! Acesse /status para acompanhar o status do seu pedido.'
        );
        
        // Abrir WhatsApp automaticamente se o link estiver disponível
        if (result.whatsapp_link) {
          console.log('Abrindo WhatsApp com link:', result.whatsapp_link);
          setTimeout(() => {
            window.open(result.whatsapp_link, '_blank');
          }, 1000);
        } else {
          console.warn('Link do WhatsApp não encontrado na resposta');
        }
        
        clearCart();
        setShowConfirmModal(false);
        setIsCartOpen(false);
        // Limpar informações do cliente
        setCustomerInfo({
          name: '',
          phone: '',
          address: '',
          complement: '',
          cep: '',
          observations: '',
          changeFor: null,
          paymentMethod: 'dinheiro'
        });
        setDeliveryInfo(null);
        setDeliveryType('entrega');
      } else {
        error(result.message || 'Erro ao processar pedido');
      }
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
      error('Erro de conexão com o servidor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=Sem+Imagem';
  };

  // ✅ NOVO: Se a loja estiver fechada, mostrar mensagem e bloquear acesso
  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (restaurantStatus && !restaurantStatus.aberto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mt-20">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center border-4 border-red-500">
              <div className="text-6xl mb-6">🚪</div>
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
                Restaurante Fechado
              </h1>
              <p className="text-gray-700 text-lg mb-6">
                {restaurantStatus.mensagem || 'Estamos fechados no momento. Volte em breve!'}
              </p>
              {restaurantStatus.horario_abertura && restaurantStatus.horario_fechamento && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Horário de Funcionamento</h3>
                  <p className="text-gray-600">
                    <span className="font-mono text-lg">{restaurantStatus.horario_abertura}</span>
                    {' às '}
                    <span className="font-mono text-lg">{restaurantStatus.horario_fechamento}</span>
                  </p>
                  {restaurantStatus.dias_funcionamento && restaurantStatus.dias_funcionamento.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Dias de funcionamento:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {restaurantStatus.dias_funcionamento.map(dia => {
                          const diasMap = {
                            'seg': 'Segunda',
                            'ter': 'Terça',
                            'qua': 'Quarta',
                            'qui': 'Quinta',
                            'sex': 'Sexta',
                            'sáb': 'Sábado',
                            'sab': 'Sábado',
                            'dom': 'Domingo'
                          };
                          return (
                            <span key={dia} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {diasMap[dia] || dia}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <p className="text-gray-500 text-sm">
                Aguardamos sua visita! 😊
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <RestaurantStatusBanner />
      
      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🍕 Cardápio Jamal Esfiharia
          </h1>
          <p className="text-gray-600 text-lg">Escolha suas delícias favoritas e faça seu pedido!</p>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar esfihas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>

              {/* Filtro de Categoria */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent appearance-none"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat} value={cat.id || cat}>{cat.name || cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isPizza = item.category && (
                item.category.toLowerCase().includes('pizza') ||
                item.category.toLowerCase().includes('pizzas')
              );
              
              return (
                <PizzaCardSimple
                  key={item.id}
                  item={item}
                  onImageError={handleImageError}
                  onClick={(product) => {
                    const category = product.category?.toLowerCase() || '';
                    
                    if (isPizza) {
                      setSelectedPizza(product);
                      setShowPizzaModal(true);
                    } else if (category.includes('beirute')) {
                      setSelectedBeirute(product);
                      setShowBeiruteModal(true);
                    } else if (category.includes('esfiha')) {
                      setSelectedEsfiha(product);
                      setShowEsfihaModal(true);
                    } else if (category.includes('pasté') || category.includes('fogazz')) {
                      setSelectedGenericProduct(product);
                      setShowGenericModal(true);
                    } else {
                      // Outros produtos: adicionar direto ao carrinho
                      addToCart(product);
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 z-40 transform hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {getCartItemCount()}
            </span>
          </button>
        )}

        {/* Carrinho Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full md:max-w-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold">🛒 Carrinho</h2>
                  <p className="text-red-100 text-sm">{getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'itens'}</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Itens do Carrinho */}
              <div className="p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.cartId} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.customName || item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteFromCart(item.cartId)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                        <p className="text-lg font-bold text-red-600">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tipo de Entrega */}
              <div className="px-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🚚 Tipo de Entrega</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryType('entrega')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      deliveryType === 'entrega'
                        ? 'bg-red-600 text-white border-2 border-red-600'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                    }`}
                  >
                    📍 Entrega em Casa
                  </button>
                  <button
                    onClick={() => setDeliveryType('retirada')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      deliveryType === 'retirada'
                        ? 'bg-green-600 text-white border-2 border-green-600'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    🏪 Retirada no Local
                  </button>
                </div>

                {/* Calculadora de Entrega - Apenas para entrega */}
                {deliveryType === 'entrega' && (
                  <div className="mt-4">
                    <DeliveryCalculator onDeliveryFeeCalculated={handleDeliveryFeeCalculated} />
                  </div>
                )}
              </div>

              {/* Dados do Cliente */}
              <div className="px-6 pb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Dados do Cliente</h3>
                <div className="space-y-3">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Digite seu nome"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone *</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => {
                        const newPhone = e.target.value;
                        setCustomerInfo({...customerInfo, phone: newPhone});
                        buscarHistoricoCliente(newPhone);
                      }}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                    {isLoadingHistory && (
                      <p className="text-sm text-gray-500 mt-1">🔄 Buscando histórico...</p>
                    )}
                    {customerHistory && (
                      <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                        <p className="text-sm text-green-900 font-semibold flex items-center gap-2">
                          <span className="text-xl">✅</span>
                          Cliente cadastrado! {customerHistory.total_pedidos} pedido(s) anterior(es)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Endereço - Apenas para entrega */}
                  {deliveryType === 'entrega' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço Completo *</label>
                        <input
                          type="text"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                          placeholder="Rua, Número - Bairro"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">* Preencha o CEP acima para buscar automaticamente. Adicione o número da casa se necessário.</p>
                      </div>

                      {/* Complemento */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Complemento</label>
                        <input
                          type="text"
                          value={customerInfo.complement}
                          onChange={(e) => setCustomerInfo({...customerInfo, complement: e.target.value})}
                          placeholder="Apto, Bloco, etc"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Mensagem para retirada */}
                  {deliveryType === 'retirada' && (
                    <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <p className="text-sm text-green-900 font-semibold flex items-center gap-2">
                        <span className="text-xl">🏪</span>
                        Você escolheu retirar no local. Não é necessário informar endereço.
                      </p>
                    </div>
                  )}

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Forma de Pagamento *</label>
                    <div className="mb-2 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                      <p className="text-sm text-blue-900 font-semibold flex items-center gap-2">
                        <span className="text-xl">💵</span>
                        O pagamento será feito com o motoboy na entrega
                      </p>
                    </div>
                    <select
                      value={customerInfo.paymentMethod}
                      onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>

                  {/* Troco (apenas se for dinheiro) */}
                  {customerInfo.paymentMethod === 'dinheiro' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Troco para quanto?</label>
                      <input
                        type="text"
                        value={customerInfo.change || ''}
                        onChange={(e) => setCustomerInfo({...customerInfo, change: e.target.value})}
                        placeholder="R$ 100,00"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                    <textarea
                      value={customerInfo.observations || ''}
                      onChange={(e) => setCustomerInfo({...customerInfo, observations: e.target.value})}
                      placeholder="Ex: Entregar sem cebola na metade B"
                      rows="3"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">R$ {getCartSubtotal().toFixed(2)}</span>
                  </div>
                  {deliveryInfo && (
                    <div className="flex justify-between text-gray-700">
                      <span>Taxa de entrega:</span>
                      <span className="font-semibold">R$ {deliveryInfo.fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="text-red-600">R$ {getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Limpar Carrinho
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Finalizar Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pizza Modal */}
        {showPizzaModal && (
          <PizzaModal
            isOpen={showPizzaModal}
            onClose={() => setShowPizzaModal(false)}
            pizza={selectedPizza}
            allPizzas={pizzaItems}
            onAddToCart={addToCart}
          />
        )}

        {/* ✅ NOVO: Esfiha Modal */}
        {showEsfihaModal && (
          <EsfihaModal
            isOpen={showEsfihaModal}
            onClose={() => setShowEsfihaModal(false)}
            esfiha={selectedEsfiha}
            onAddToCart={addToCart}
          />
        )}

        {/* ✅ NOVO: Generic Product Modal (Pastéis, Fogazzas, etc) */}
        {showGenericModal && (
          <GenericProductModal
            isOpen={showGenericModal}
            onClose={() => setShowGenericModal(false)}
            product={selectedGenericProduct}
            onAddToCart={addToCart}
          />
        )}

        {/* ✅ NOVO: Beirute Modal */}
        {showBeiruteModal && (
          <BeiruteModal
            isOpen={showBeiruteModal}
            onClose={() => setShowBeiruteModal(false)}
            beirute={selectedBeirute}
            onAddToCart={addToCart}
          />
        )}

        {/* Half and Half Modal */}
        {showHalfAndHalf && (
          <HalfAndHalfSelector
            isOpen={showHalfAndHalf}
            onClose={() => setShowHalfAndHalf(false)}
            pizzas={pizzaItems}
            selectedSize={halfAndHalfData.size}
            onConfirm={handleHalfAndHalfConfirm}
          />
        )}

        {/* Confirm Modal */}
        {showConfirmModal && (
          <ConfirmModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={confirmOrder}
            title="Confirmar Pedido"
            message="Deseja confirmar seu pedido?"
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default FullMenu;
