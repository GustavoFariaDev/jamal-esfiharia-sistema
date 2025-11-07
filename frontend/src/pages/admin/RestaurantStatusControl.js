import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

/**
 * Componente para controlar o status de abertura/fechamento do restaurante
 * Apenas para administradores
 */
const RestaurantStatusControl = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMinutes, setPauseMinutes] = useState(30);

  // Carregar status atual
  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/configuracao/status/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar status');
      }

      const data = await response.json();
      setStatus(data.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Alternar status (abrir/fechar)
  const toggleStatus = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/configuracao/status/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aberto: !status.aberto,
          mensagem: status.mensagem_fechamento
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      const data = await response.json();
      setStatus(data.status);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Atualizar configurações
  const updateConfig = async (updates) => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/configuracao/status/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar configurações');
      }

      const data = await response.json();
      setStatus(data.status);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Pausar temporariamente
  const pausarTemporario = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/configuracao/status/pausar-temporario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ minutos: pauseMinutes })
      });

      if (!response.ok) {
        throw new Error('Erro ao pausar pedidos');
      }

      const data = await response.json();
      setStatus(data.status);
      setSuccess(data.message);
      setShowPauseModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar pausa
  const cancelarPausa = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/configuracao/status/cancelar-pausa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar pausa');
      }

      const data = await response.json();
      setStatus(data.status);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // Atualizar status a cada 30 segundos para verificar pausa expirada
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Controle do Restaurante</span>
          <div className={`px-4 py-2 rounded-full text-white font-bold ${status.aberto ? 'bg-green-500' : 'bg-red-500'}`}>
            {status.aberto ? '🟢 ABERTO' : '🔴 FECHADO'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mensagens de feedback */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Botão principal de toggle */}
        <div className="flex justify-center">
          <Button
            onClick={toggleStatus}
            disabled={isUpdating}
            size="lg"
            className={`w-full max-w-md text-lg font-bold ${
              status.aberto 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isUpdating ? 'Atualizando...' : status.aberto ? '🔒 FECHAR RESTAURANTE' : '🔓 ABRIR RESTAURANTE'}
          </Button>
        </div>

        {/* Informações de horário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Horário de Funcionamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Abertura:</span>
                <span className="font-mono">{status.horario_abertura || 'Não definido'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fechamento:</span>
                <span className="font-mono">{status.horario_fechamento || 'Não definido'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Status do Sistema</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Aceita Pedidos:</span>
                <span className={status.aceita_pedidos ? 'text-green-600' : 'text-red-600'}>
                  {status.aceita_pedidos ? '✅ Sim' : '❌ Não'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modo Manutenção:</span>
                <span className={status.modo_manutencao ? 'text-orange-600' : 'text-green-600'}>
                  {status.modo_manutencao ? '⚠️ Ativo' : '✅ Inativo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dias de funcionamento */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Dias de Funcionamento</h3>
          <div className="flex flex-wrap gap-2">
            {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map(dia => {
              const diasMap = {
                'seg': 'Segunda',
                'ter': 'Terça',
                'qua': 'Quarta',
                'qui': 'Quinta',
                'sex': 'Sexta',
                'sab': 'Sábado',
                'dom': 'Domingo'
              };
              
              const isActive = status.dias_funcionamento && status.dias_funcionamento.includes(dia);
              
              return (
                <span
                  key={dia}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isActive 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {diasMap[dia]}
                </span>
              );
            })}
          </div>
        </div>

        {/* Mensagem de fechamento */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Mensagem de Fechamento</h3>
          <p className="text-sm text-gray-600">
            {status.mensagem_fechamento || 'Nenhuma mensagem configurada'}
          </p>
        </div>

        {/* Status de pausa temporária */}
        {status.pausa_temporaria && status.pausa_ate && (
          <Alert className="bg-orange-50 border-orange-300">
            <AlertDescription className="text-orange-800">
              ⏸️ <strong>Pedidos pausados temporariamente</strong>
              <br />
              Retomando em: {new Date(status.pausa_ate).toLocaleString('pt-BR')}
              <br />
              <Button
                onClick={cancelarPausa}
                disabled={isUpdating}
                size="sm"
                className="mt-2 bg-orange-600 hover:bg-orange-700"
              >
                Cancelar Pausa Agora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Controles adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <Button
            onClick={() => setShowPauseModal(true)}
            disabled={isUpdating || status.pausa_temporaria}
            variant="outline"
            className="bg-orange-50 hover:bg-orange-100"
          >
            ⏸️ Pausar por Tempo
          </Button>
          
          <Button
            onClick={() => updateConfig({ aceita_pedidos: !status.aceita_pedidos })}
            disabled={isUpdating}
            variant="outline"
          >
            {status.aceita_pedidos ? '🚫 Pausar Pedidos' : '✅ Aceitar Pedidos'}
          </Button>
          
          <Button
            onClick={() => updateConfig({ modo_manutencao: !status.modo_manutencao })}
            disabled={isUpdating}
            variant="outline"
          >
            {status.modo_manutencao ? '🔧 Desativar Manutenção' : '⚠️ Modo Manutenção'}
          </Button>
        </div>

        {/* Modal de pausa temporária */}
        {showPauseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">⏸️ Pausar Pedidos Temporariamente</h3>
              <p className="text-sm text-gray-600 mb-4">
                Útil quando a loja está muito lotada. Os pedidos serão pausados automaticamente pelo tempo escolhido.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tempo de pausa (minutos):</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={pauseMinutes}
                  onChange={(e) => setPauseMinutes(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setPauseMinutes(15)}>15 min</Button>
                  <Button size="sm" variant="outline" onClick={() => setPauseMinutes(30)}>30 min</Button>
                  <Button size="sm" variant="outline" onClick={() => setPauseMinutes(60)}>1 hora</Button>
                  <Button size="sm" variant="outline" onClick={() => setPauseMinutes(120)}>2 horas</Button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={pausarTemporario}
                  disabled={isUpdating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Confirmar Pausa
                </Button>
                <Button
                  onClick={() => setShowPauseModal(false)}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Botão de atualizar */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={loadStatus}
            disabled={isUpdating}
            variant="ghost"
            size="sm"
          >
            🔄 Atualizar Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantStatusControl;

