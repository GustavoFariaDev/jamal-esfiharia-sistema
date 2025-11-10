import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, Search, RefreshCw, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificacoesPedido from './NotificacoesPedido';

const AcompanhamentoPedido = () => {
  const navigate = useNavigate();
  const [telefone, setTelefone] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consultado, setConsultado] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [historico, setHistorico] = useState({});

  // Definir os passos do progresso do pedido
  const getOrderSteps = () => [
    { key: 'pendente', label: 'Recebido', icon: Package },
    { key: 'aprovado', label: 'Confirmado', icon: CheckCircle },
    { key: 'em_preparacao', label: 'Em Preparo', icon: Clock },
    { key: 'pronto_retirada', label: 'Pronto', icon: Package },
    { key: 'a_caminho', label: 'A Caminho', icon: Truck },
    { key: 'entregue', label: 'Entregue', icon: CheckCircle }
  ];

  const getStatusInfo = (status) => {
    const statusMap = {
      'pagamento_pendente': {
        label: 'Pagamento Pendente',
        icon: Clock,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        step: 0
      },
      'pendente': {
        label: 'Pedido Recebido',
        icon: Package,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-800',
        step: 0
      },
      'aprovado': {
        label: 'Pedido Confirmado',
        icon: CheckCircle,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-800',
        step: 1
      },
      'em_preparacao': {
        label: 'Em Preparação',
        icon: Clock,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-800',
        step: 2
      },
      'pronto_retirada': {
        label: 'Pronto para Retirada/Entrega',
        icon: Package,
        color: 'teal',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-300',
        textColor: 'text-teal-800',
        step: 3
      },
      'a_caminho': {
        label: 'Saiu para Entrega',
        icon: Truck,
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-300',
        textColor: 'text-indigo-800',
        step: 4
      },
      'entregue': {
        label: 'Pedido Entregue',
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-800',
        step: 5
      },
      'cancelado': {
        label: 'Pedido Cancelado',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        step: -1
      },
      'falha_pagamento': {
        label: 'Falha no Pagamento',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        step: -1
      }
    };
    
    return statusMap[status] || {
      label: status,
      icon: Package,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-800',
      step: 0
    };
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    setTelefone(formatarTelefone(valor));
  };

  const buscarHistorico = async (pedidoId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos/${pedidoId}/historico-publico`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      if (data.status === 'success') {
        setHistorico(prev => ({
          ...prev,
          [pedidoId]: data.data || data.historico || []
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  };

  const consultarStatus = async (silent = false) => {
    if (!telefone.trim()) {
      setError('Por favor, informe seu telefone');
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
        setError(null);
        setConsultado(false);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/pedidos/consultar-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telefone })
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setConsultado(true);
        setLastUpdate(new Date());
        if (data.data.encontrado) {
          setPedidos(data.data.pedidos);
          setNomeCliente(data.data.nome_cliente);
          
          // Buscar histórico de cada pedido
          data.data.pedidos.forEach(pedido => {
            buscarHistorico(pedido.id);
          });
        } else {
          setPedidos([]);
          setNomeCliente('');
          if (!silent) {
            setError('Nenhum pedido encontrado para este telefone');
          }
        }
      } else {
        if (!silent) {
          setError(data.message || 'Erro ao consultar status');
        }
      }
    } catch (err) {
      console.error('Erro ao consultar status:', err);
      if (!silent) {
        setError('Erro de conexão com o servidor');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    if (autoRefresh && consultado && telefone) {
      const interval = setInterval(() => {
        consultarStatus(true); // silent = true
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, consultado, telefone]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      consultarStatus();
    }
  };

  const renderProgressBar = (pedido) => {
    const statusInfo = getStatusInfo(pedido.status);
    const steps = getOrderSteps();
    const currentStep = statusInfo.step;

    if (currentStep === -1) {
      // Pedido cancelado ou com falha
      return (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-red-800 font-semibold text-center flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5" />
            {statusInfo.label}
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                {/* Ícone */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <StepIcon className="w-6 h-6" />
                </div>
                
                {/* Label */}
                <p
                  className={`text-xs text-center font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>

                {/* Linha conectora */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-1 -z-10">
                    <div
                      className={`h-full ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeline = (pedidoId) => {
    const pedidoHistorico = historico[pedidoId] || [];
    
    if (pedidoHistorico.length === 0) {
      return null;
    }

    return (
      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico do Pedido
        </h4>
        <div className="space-y-3">
          {pedidoHistorico.map((item, index) => {
            const statusInfo = getStatusInfo(item.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={index} className="flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${statusInfo.textColor}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{statusInfo.label}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(item.data_mudanca).toLocaleString('pt-BR')}
                  </p>
                  {item.observacao && (
                    <p className="text-sm text-gray-700 mt-1">{item.observacao}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">📦 Acompanhar Meu Pedido</h1>
            <div className="flex items-center gap-3">
              {telefone && telefone.length >= 14 && (
                <NotificacoesPedido telefone={telefone.replace(/\D/g, '')} />
              )}
              <button
                onClick={() => navigate('/')}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Voltar
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Acompanhe em tempo real o status do seu pedido
          </p>

          {/* Formulário de Consulta */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <input
                type="tel"
                value={telefone}
                onChange={handleTelefoneChange}
                onKeyPress={handleKeyPress}
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                maxLength="15"
              />
            </div>
            <button
              onClick={() => consultarStatus(false)}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar
                </>
              )}
            </button>
          </div>

          {/* Atualização Automática */}
          {consultado && pedidos.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700 cursor-pointer">
                  Atualizar automaticamente a cada 30 segundos
                </label>
              </div>
              {lastUpdate && (
                <p className="text-xs text-gray-600">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              )}
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Resultados */}
        {consultado && pedidos.length > 0 && (
          <div className="space-y-4">
            {/* Nome do Cliente */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-lg">
                <span className="text-gray-600">Olá,</span>{' '}
                <span className="font-bold text-gray-900">{nomeCliente}!</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Você tem {pedidos.length} pedido{pedidos.length > 1 ? 's' : ''} em andamento
              </p>
            </div>

            {/* Lista de Pedidos */}
            <div className="space-y-4">
              {pedidos.map((pedido) => {
                const statusInfo = getStatusInfo(pedido.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={pedido.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header do Pedido */}
                    <div className={`${statusInfo.bgColor} border-b-2 ${statusInfo.borderColor} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-8 h-8 ${statusInfo.textColor}`} />
                          <div>
                            <p className={`text-xl font-bold ${statusInfo.textColor}`}>{statusInfo.label}</p>
                            <p className="text-sm text-gray-600">
                              Pedido #{pedido.id} - {new Date(pedido.data_criacao).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Valor Total</p>
                          <p className="text-2xl font-bold text-green-600">
                            R$ {pedido.valor_total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="p-6 bg-gray-50">
                      <h3 className="font-semibold text-gray-900 mb-4">Progresso do Pedido</h3>
                      <div className="relative">
                        {renderProgressBar(pedido)}
                      </div>
                    </div>

                    {/* Detalhes do Pedido */}
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Tipo de Entrega:</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {pedido.forma_entrega === 'entrega' ? '🚚 Entrega em Domicílio' : '🏪 Retirada no Local'}
                        </p>
                      </div>

                      {/* Itens do Pedido */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Itens do Pedido:</p>
                        <div className="space-y-2">
                          {pedido.itens.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-semibold text-gray-900">{item.esfiha}</p>
                                {item.observacoes && (
                                  <p className="text-sm text-gray-600">{item.observacoes}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                                </p>
                                <p className="font-semibold text-gray-900">
                                  R$ {item.subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline do Histórico */}
                      {renderTimeline(pedido.id)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensagem quando consultado mas sem pedidos */}
        {consultado && pedidos.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">
              Não encontramos pedidos ativos para este telefone. Verifique se o número está correto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcompanhamentoPedido;
