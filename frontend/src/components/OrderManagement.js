import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, RefreshCw, Printer } from 'lucide-react';
import apiService from '../services/apiService';
import authService from '../services/authService';
import { useToastContext } from '../contexts/ToastContext';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const { success, error } = useToastContext();

  useEffect(() => {
    fetchOrders();
    // Atualizar pedidos a cada 30 segundos
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
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
        // A API retorna { status: 'success', data: [...] } ou { status: 'success', pedidos: [...] }
        setOrders(data.data || data.pedidos || []);
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
        fetchOrders();
      } else {
        throw new Error('Erro ao atualizar pedido');
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      error('Erro ao atualizar status do pedido');
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
    return iconMap[status] || <Clock className="w-4 h-4" />;
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handlePrintOrder = async (orderId, printType = 'pdf') => {
    try {
      setLoading(true);
      const result = await apiService.printOrder(orderId, printType);
      
      if (result.success) {
        if (result.data?.pdf_url) {
          // Abrir PDF em nova aba
          const baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
          const apiUrl = baseUrl.replace('/api', '');
          const fullUrl = `${apiUrl}${result.data.pdf_url}`;
          window.open(fullUrl, '_blank');
          success('PDF gerado com sucesso!');
        } else {
          success('Pedido enviado para impressão!');
        }
      } else {
        error(result.error || 'Erro ao imprimir pedido');
      }
    } catch (err) {
      console.error('Erro ao imprimir pedido:', err);
      error('Erro de conexão ao imprimir pedido');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Pedidos</h2>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
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
          <p className="mt-2 text-gray-500">Nenhum pedido encontrado</p>
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

                <button
                  onClick={() => handlePrintOrder(order.id, 'pdf')}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                  title="Imprimir Pedido (PDF)"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>

                {order.status === 'pendente' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'aprovado')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelado')}
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
                    className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 text-sm"
                  >
                    Marcar como Entregue
                  </button>
                )}
              </div>
            </div>
          ))}
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
                          <p className="font-medium">{item.esfiha || item.nome || 'Item'}</p>
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
                <button
                  onClick={() => handlePrintOrder(selectedOrder.id, 'pdf')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Printer className="w-5 h-5" />
                  Imprimir Pedido
                </button>
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
