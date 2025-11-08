import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';

const NotificacoesPedido = ({ telefone }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error } = useToastContext();

  useEffect(() => {
    if (telefone) {
      fetchNotificacoes();
      // Atualizar notificações a cada 30 segundos
      const interval = setInterval(fetchNotificacoes, 30000);
      return () => clearInterval(interval);
    }
  }, [telefone]);

  const fetchNotificacoes = async () => {
    if (!telefone) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/notificacoes/por-telefone/${telefone}`
      );

      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/notificacoes/${notificacaoId}/marcar-lida?telefone=${telefone}`,
        {
          method: 'PATCH'
        }
      );

      if (response.ok) {
        // Atualizar lista de notificações
        setNotificacoes(prev =>
          prev.map(n =>
            n.id === notificacaoId ? { ...n, lida: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      error('Erro ao marcar notificação como lida');
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/notificacoes/marcar-todas-lidas?telefone=${telefone}`,
        {
          method: 'PATCH'
        }
      );

      if (response.ok) {
        // Atualizar todas as notificações
        setNotificacoes(prev =>
          prev.map(n => ({ ...n, lida: true }))
        );
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      error('Erro ao marcar notificações como lidas');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  if (!telefone) return null;

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setShowNotificacoes(!showNotificacoes)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        title="Notificações"
      >
        <Bell className="w-6 h-6" />
        {naoLidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {/* Painel de Notificações */}
      {showNotificacoes && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotificacoes(false)}
          />

          {/* Painel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
                {naoLidas > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {naoLidas}
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                {naoLidas > 0 && (
                  <button
                    onClick={marcarTodasComoLidas}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowNotificacoes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Carregando...
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificacoes.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notificacao.lida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 mb-1">
                            {notificacao.mensagem}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(notificacao.data_criacao)}
                          </p>
                        </div>
                        {!notificacao.lida && (
                          <button
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacoesPedido;
