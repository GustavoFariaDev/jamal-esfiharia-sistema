import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, RefreshCw, Printer, Search, Bell, History } from 'lucide-react';
import apiService from '../services/apiService';
import authService from '../services/authService';
import qzTrayService from '../services/qzTrayService';
import { useToastContext } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPrintMenu, setShowPrintMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // MELHORIA 2: Busca
  const [showConfirmModal, setShowConfirmModal] = useState(false); // MELHORIA 1: Modal de confirmação
  const [confirmAction, setConfirmAction] = useState(null); // MELHORIA 1: Ação a confirmar
  const [orderHistory, setOrderHistory] = useState({}); // MELHORIA 3: Histórico de status
  const [showHistoryModal, setShowHistoryModal] = useState(false); // MELHORIA 3: Modal de histórico
  const [selectedOrderHistory, setSelectedOrderHistory] = useState(null); // MELHORIA 3: Pedido selecionado para histórico
  const [newOrdersCount, setNewOrdersCount] = useState(0); // MELHORIA 4: Notificações
  const [lastOrderCount, setLastOrderCount] = useState(0); // MELHORIA 4: Controle de novos pedidos
  const { success, error, info } = useToastContext();

  useEffect(() => {
    fetchOrders();
    // Atualizar pedidos a cada 30 segundos e verificar novos pedidos
    const interval = setInterval(() => {
      fetchOrders(true); // true = verificar novos pedidos
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechar menu de impressão ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPrintMenu && !event.target.closest('.relative')) {
        setShowPrintMenu(null);
      }
    };
    
    if (showPrintMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPrintMenu]);

  // MELHORIA 4: Notificação de novos pedidos
  const checkForNewOrders = (currentOrders) => {
    if (lastOrderCount > 0 && currentOrders.length > lastOrderCount) {
      const newCount = currentOrders.length - lastOrderCount;
      setNewOrdersCount(newCount);
      
      // Mostrar notificação
      info(`${newCount} novo${newCount > 1 ? 's' : ''} pedido${newCount > 1 ? 's' : ''}!`);
      
      // Tocar som de notificação (opcional)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo Pedido!', {
          body: `Você tem ${newCount} novo${newCount > 1 ? 's' : ''} pedido${newCount > 1 ? 's' : ''}`,
          icon: '/logo192.png'
        });
      }
      
      // Limpar contador após 5 segundos
      setTimeout(() => setNewOrdersCount(0), 5000);
    }
    setLastOrderCount(currentOrders.length);
  };

  const fetchOrders = async (checkNew = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos/admin`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const ordersData = data.data || data.pedidos || [];
        setOrders(ordersData);
        
        // MELHORIA 4: Verificar novos pedidos
        if (checkNew) {
          checkForNewOrders(ordersData);
        } else {
          setLastOrderCount(ordersData.length);
        }
      } else {
        throw new Error('Erro ao carregar pedidos');
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  // MELHORIA 3: Buscar histórico de status de um pedido
  const fetchOrderHistory = async (orderId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos/${orderId}/historico`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrderHistory(prev => ({
          ...prev,
          [orderId]: data.data || data.historico || []
        }));
        return data.data || data.historico || [];
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  };

  // MELHORIA 3: Mostrar histórico de status
  const viewOrderHistory = async (order) => {
    const history = await fetchOrderHistory(order.id);
    setSelectedOrderHistory({ order, history });
    setShowHistoryModal(true);
  };

  // MELHORIA 1: Confirmar ação crítica
  const confirmCriticalAction = (action, orderId, newStatus, actionLabel) => {
    setConfirmAction({
      action,
      orderId,
      newStatus,
      actionLabel
    });
    setShowConfirmModal(true);
  };

  // MELHORIA 1: Executar ação após confirmação
  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    const { action, orderId, newStatus } = confirmAction;

    if (action === 'updateStatus') {
      await updateOrderStatus(orderId, newStatus);
    } else if (action === 'deleteOrder') {
      await deleteOrder(orderId);
    }

    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos/admin/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        success(`Pedido atualizado para: ${getStatusLabel(newStatus)}`);
        setFilterStatus('all');
        fetchOrders();
      } else {
        throw new Error('Erro ao atualizar pedido');
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      error('Erro ao atualizar status do pedido');
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos/admin/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      if (response.ok) {
        success('Pedido excluído com sucesso');
        fetchOrders();
      } else {
        throw new Error('Erro ao excluir pedido');
      }
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      error('Erro ao excluir pedido');
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'aprovado': 'Confirmado',
      'em_preparacao': 'Em Preparo',
      'pronto_retirada': 'Pronto',
      'a_caminho': 'Saiu para Entrega',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aprovado': 'bg-blue-100 text-blue-800',
      'em_preparacao': 'bg-purple-100 text-purple-800',
      'pronto_retirada': 'bg-green-100 text-green-800',
      'a_caminho': 'bg-indigo-100 text-indigo-800',
      'entregue': 'bg-green-200 text-green-900',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'pendente': <Clock className="w-4 h-4" />,
      'aprovado': <CheckCircle className="w-4 h-4" />,
      'em_preparacao': <Package className="w-4 h-4" />,
      'pronto_retirada': <CheckCircle className="w-4 h-4" />,
      'a_caminho': <Truck className="w-4 h-4" />,
      'entregue': <CheckCircle className="w-4 h-4" />,
      'cancelado': <XCircle className="w-4 h-4" />
    };
    return iconMap[status] || <Package className="w-4 h-4" />;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handlePrintOrder = async (orderId, printType) => {
    try {
      // Se for impressão térmica direta, usar QZ Tray
      if (printType === 'thermal' || printType === 'both') {
        console.log(`Iniciando impressão térmica do pedido #${orderId}`);
        
        // Buscar dados do pedido
        const orderResponse = await apiService.getOrder(orderId);
        console.log('Dados do pedido recebidos:', orderResponse);
        
        if (orderResponse.success) {
          const orderData = orderResponse.data;
          console.log('Order data para impressão:', orderData);
          
          // Imprimir via QZ Tray
          console.log('Enviando para QZ Tray...');
          const printResult = await qzTrayService.printOrder(orderData);
          console.log('Resultado da impressão térmica:', printResult);
          
          if (printResult.success) {
            success(printResult.message);
            
            // Se for 'both', continuar para gerar PDF também
            if (printType !== 'both') {
              return;
            }
          } else {
            // Se falhou e era apenas thermal, mostrar erro
            if (printType === 'thermal') {
              error(printResult.message);
              return;
            }
            // Se era 'both', continuar para PDF como fallback
            info('Impressão térmica falhou. Gerando PDF...');
          }
        }
      }
      
      // Impressão PDF (ou fallback se térmica falhou)
      if (printType === 'pdf' || printType === 'both') {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || '/api'}/print/pedido/${orderId}/imprimir`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authService.getToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tipo: 'pdf' })
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Resposta da API de impressão:', data);
          
          if (data.status === 'success' && data.pdf_url) {
            console.log('PDF URL recebida:', data.pdf_url);
            
            // Fazer download do PDF
            // data.pdf_url já vem com /api/print/download/...
            // REACT_APP_API_BASE_URL pode ser vazio (produção) ou conter domínio completo
            const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
            // Remove /api do final se existir, pois data.pdf_url já tem /api
            const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
            const pdfUrl = `${cleanBaseUrl}${data.pdf_url}`;
            console.log('Base URL:', baseUrl);
            console.log('Clean Base URL:', cleanBaseUrl);
            console.log('URL completa do PDF:', pdfUrl);
            
            const pdfResponse = await fetch(pdfUrl, {
              headers: {
                'Authorization': `Bearer ${authService.getToken()}`
              }
            });
            
            console.log('Status do download do PDF:', pdfResponse.status);
            
            if (pdfResponse.ok) {
              const blob = await pdfResponse.blob();
              console.log('Blob recebido, tamanho:', blob.size);
              
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = data.pdf_filename || `pedido_${orderId}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              success('PDF baixado com sucesso!');
            } else {
              const errorText = await pdfResponse.text();
              console.error('Erro ao baixar PDF:', errorText);
              throw new Error(`Erro ao baixar PDF: ${pdfResponse.status}`);
            }
          } else {
            console.error('Resposta sem pdf_url:', data);
            throw new Error(data.message || 'PDF não foi gerado');
          }
        } else {
          const errorData = await response.json();
          console.error('Erro na API:', errorData);
          throw new Error(errorData.message || 'Erro ao gerar PDF');
        }
      }
    } catch (err) {
      console.error('Erro ao imprimir:', err);
      error(err.message || 'Erro ao imprimir pedido');
    }
  };

  // MELHORIA 2: Filtrar pedidos por busca
  const filteredOrders = orders.filter(order => {
    // Filtro por status
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    
    // Filtro por busca (número do pedido, cliente ou telefone)
    const searchMatch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      (order.nome_cliente && order.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.telefone && order.telefone.includes(searchTerm));
    
    return statusMatch && searchMatch;
  });

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Pedidos</h2>
        <div className="flex items-center gap-4">
          {/* MELHORIA 4: Indicador de novos pedidos */}
          {newOrdersCount > 0 && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg animate-pulse">
              <Bell className="w-5 h-5" />
              <span className="font-medium">{newOrdersCount} novo{newOrdersCount > 1 ? 's' : ''} pedido{newOrdersCount > 1 ? 's' : ''}!</span>
            </div>
          )}
          <button
            onClick={() => fetchOrders(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* MELHORIA 2: Campo de busca */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número do pedido, cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos ({orders.length})
        </button>
        <button
          onClick={() => setFilterStatus('pendente')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'pendente'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pendentes ({orders.filter(o => o.status === 'pendente').length})
        </button>
        <button
          onClick={() => setFilterStatus('aprovado')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'aprovado'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Aprovados ({orders.filter(o => o.status === 'aprovado').length})
        </button>
        <button
          onClick={() => setFilterStatus('em_preparacao')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'em_preparacao'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Em Preparo ({orders.filter(o => o.status === 'em_preparacao').length})
        </button>
        <button
          onClick={() => setFilterStatus('pronto_retirada')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'pronto_retirada'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Prontos ({orders.filter(o => o.status === 'pronto_retirada').length})
        </button>
      </div>

      {/* Lista de Pedidos */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">
            {searchTerm ? 'Nenhum pedido encontrado com esse critério de busca' : 'Nenhum pedido encontrado'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Pedido #{order.id}
                  </h3>
                  <p className="text-sm text-gray-600">{order.nome_cliente || 'Cliente não informado'}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.data_criacao)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{order.telefone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-bold text-green-600">{formatCurrency(order.valor_total)}</p>
                </div>
              </div>

              {order.endereco && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Endereço de Entrega</p>
                  <p className="text-sm">{order.endereco}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => viewOrderDetails(order)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Detalhes
                </button>

                {/* MELHORIA 3: Botão de histórico */}
                <button
                  onClick={() => viewOrderHistory(order)}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                  title="Ver histórico de status"
                >
                  <History className="w-4 h-4" />
                  Histórico
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowPrintMenu(showPrintMenu === order.id ? null : order.id)}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                    title="Opções de Impressão"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                    <span className="ml-1">▼</span>
                  </button>
                  
                  {showPrintMenu === order.id && (
                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          handlePrintOrder(order.id, 'pdf');
                          setShowPrintMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir PDF
                      </button>
                      <button
                        onClick={() => {
                          handlePrintOrder(order.id, 'thermal');
                          setShowPrintMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm border-t"
                      >
                        <Printer className="w-4 h-4" />
                        Impressora Térmica
                      </button>
                      <button
                        onClick={() => {
                          handlePrintOrder(order.id, 'both');
                          setShowPrintMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm border-t rounded-b-lg"
                      >
                        <Printer className="w-4 h-4" />
                        PDF + Térmica
                      </button>
                    </div>
                  )}
                </div>

                {/* MELHORIA 1: Botões com confirmação */}
                {order.status === 'pendente' && (
                  <>
                    <button
                      onClick={() => confirmCriticalAction('updateStatus', order.id, 'aprovado', 'Confirmar Pedido')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => confirmCriticalAction('updateStatus', order.id, 'cancelado', 'Cancelar Pedido')}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Cancelar
                    </button>
                  </>
                )}

                {order.status === 'aprovado' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'em_preparacao')}
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    Iniciar Preparo
                  </button>
                )}

                {order.status === 'em_preparacao' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'pronto_retirada')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Marcar como Pronto
                  </button>
                )}

                {order.status === 'pronto_retirada' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'a_caminho')}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    Saiu para Entrega
                  </button>
                )}

                {order.status === 'a_caminho' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'entregue')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Marcar como Entregue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MELHORIA 1: Modal de Confirmação */}
      {showConfirmModal && confirmAction && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setConfirmAction(null);
          }}
          onConfirm={executeConfirmedAction}
          title={`Confirmar ${confirmAction.actionLabel}`}
          message={`Tem certeza que deseja ${confirmAction.actionLabel.toLowerCase()}? Esta ação não pode ser desfeita.`}
          confirmText="Sim, confirmar"
          cancelText="Cancelar"
        />
      )}

      {/* MELHORIA 3: Modal de Histórico */}
      {showHistoryModal && selectedOrderHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Histórico do Pedido #{selectedOrderHistory.order.id}
              </h3>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedOrderHistory(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {selectedOrderHistory.history && selectedOrderHistory.history.length > 0 ? (
                <div className="space-y-4">
                  {selectedOrderHistory.history.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{getStatusLabel(item.status)}</p>
                        <p className="text-sm text-gray-600">{formatDate(item.data_mudanca)}</p>
                        {item.usuario && (
                          <p className="text-xs text-gray-500">Por: {item.usuario}</p>
                        )}
                        {item.observacao && (
                          <p className="text-sm text-gray-700 mt-1">{item.observacao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhum histórico disponível para este pedido.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Pedido #{selectedOrder.id}
                  </h3>
                  <p className="text-gray-600">{formatDate(selectedOrder.data_criacao)}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium">{selectedOrder.nome_cliente || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{selectedOrder.telefone || '-'}</p>
                  </div>
                </div>

                {selectedOrder.endereco && (
                  <div>
                    <p className="text-sm text-gray-600">Endereço de Entrega</p>
                    <p className="font-medium">{selectedOrder.endereco}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Itens do Pedido</p>
                  <div className="space-y-2">
                    {selectedOrder.itens && selectedOrder.itens.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">
                            {item.esfiha || item.nome || 'Item'}
                            {item.tamanho && ` (${item.tamanho.charAt(0).toUpperCase() + item.tamanho.slice(1)})`}
                          </p>
                          {item.tipo_massa && (
                            <p className="text-xs text-gray-500 italic">
                              {item.tipo_massa === 'aberta' ? 'Aberta' : 'Fechada'}
                            </p>
                          )}
                          {item.acrescimos && item.acrescimos.length > 0 && (
                            <p className="text-xs text-gray-600">
                              + {item.acrescimos.map(a => a.acrescimo_nome || a.nome).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                        </div>
                        <p className="font-bold">{formatCurrency(item.preco_unitario * item.quantidade)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.observacoes && (
                  <div>
                    <p className="text-sm text-gray-600">Observações</p>
                    <p className="font-medium">{selectedOrder.observacoes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Valor Total</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.valor_total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowPrintMenu(showPrintMenu === 'modal' ? null : 'modal')}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir Pedido
                    <span className="ml-1">▼</span>
                  </button>
                  
                  {showPrintMenu === 'modal' && (
                    <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <button
                        onClick={() => {
                          handlePrintOrder(selectedOrder.id, 'pdf');
                          setShowPrintMenu(null);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 text-sm rounded-t-lg"
                      >
                        <Printer className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Imprimir PDF</div>
                          <div className="text-xs text-gray-500">Abre em nova aba</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          handlePrintOrder(selectedOrder.id, 'thermal');
                          setShowPrintMenu(null);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 text-sm border-t"
                      >
                        <Printer className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Impressora Térmica</div>
                          <div className="text-xs text-gray-500">Imprime direto</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          handlePrintOrder(selectedOrder.id, 'both');
                          setShowPrintMenu(null);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 text-sm border-t rounded-b-lg"
                      >
                        <Printer className="w-4 h-4" />
                        <div>
                          <div className="font-medium">PDF + Térmica</div>
                          <div className="text-xs text-gray-500">Ambos os formatos</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
