import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConsultarStatus = () => {
  const navigate = useNavigate();
  const [telefone, setTelefone] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consultado, setConsultado] = useState(false);

  const getStatusInfo = (status) => {
    const statusMap = {
      'pagamento_pendente': {
        label: 'Pagamento Pendente',
        icon: Clock,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800'
      },
      'pendente': {
        label: 'Pedido Recebido',
        icon: Package,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-800'
      },
      'aprovado': {
        label: 'Pedido Aprovado',
        icon: CheckCircle,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-800'
      },
      'em_preparacao': {
        label: 'Em Preparação',
        icon: Clock,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-800'
      },
      'pronto_retirada': {
        label: 'Pronto para Retirada',
        icon: Package,
        color: 'teal',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-300',
        textColor: 'text-teal-800'
      },
      'a_caminho': {
        label: 'A Caminho',
        icon: Truck,
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-300',
        textColor: 'text-indigo-800'
      },
      'entregue': {
        label: 'Entregue',
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        textColor: 'text-green-800'
      },
      'cancelado': {
        label: 'Cancelado',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800'
      },
      'falha_pagamento': {
        label: 'Falha no Pagamento',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800'
      }
    };
    
    return statusMap[status] || {
      label: status,
      icon: Package,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-800'
    };
  };

  const formatarTelefone = (valor) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');
    
    // Formata conforme o tamanho
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

  const consultarStatus = async () => {
    if (!telefone.trim()) {
      setError('Por favor, informe seu telefone');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setConsultado(false);

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
        if (data.data.encontrado) {
          setPedidos(data.data.pedidos);
          setNomeCliente(data.data.nome_cliente);
        } else {
          setPedidos([]);
          setNomeCliente('');
          setError('Nenhum pedido encontrado para este telefone');
        }
      } else {
        setError(data.message || 'Erro ao consultar status');
      }
    } catch (err) {
      console.error('Erro ao consultar status:', err);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      consultarStatus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">📦 Consultar Status do Pedido</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Voltar
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Digite seu telefone para consultar o status dos seus pedidos
          </p>

          {/* Formulário de Consulta */}
          <div className="flex gap-3">
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
              onClick={consultarStatus}
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
                <span className="text-gray-600">Cliente:</span>{' '}
                <span className="font-bold text-gray-900">{nomeCliente}</span>
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
                          <StatusIcon className={`w-6 h-6 ${statusInfo.textColor}`} />
                          <div>
                            <p className={`font-bold ${statusInfo.textColor}`}>{statusInfo.label}</p>
                            <p className="text-sm text-gray-600">
                              Pedido #{pedido.id} - {new Date(pedido.data_criacao).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Valor Total</p>
                          <p className="text-xl font-bold text-green-600">
                            R$ {pedido.valor_total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes do Pedido */}
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Tipo de Entrega:</p>
                        <p className="font-semibold text-gray-900">
                          {pedido.forma_entrega === 'entrega' ? '🚚 Entrega' : '🏪 Retirada no Local'}
                        </p>
                      </div>

                      {/* Itens do Pedido */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Itens do Pedido:</p>
                        <div className="space-y-2">
                          {pedido.itens.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
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
              Não encontramos pedidos para este telefone. Verifique se o número está correto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultarStatus;
