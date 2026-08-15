import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

/**
 * Banner de status do restaurante para exibir aos clientes
 * Mostra se o restaurante está aberto ou fechado
 */
const RestaurantStatusBanner = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar status público
  const loadStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || '/api'}/configuracao/status`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Erro ao carregar status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    
    // Atualizar status a cada 1 minuto
    const interval = setInterval(loadStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) {
    return null;
  }

  // Se está aberto e aceita pedidos, não mostrar banner
  if (status.aberto && status.aceita_pedidos) {
    return null;
  }

  return (
    <div className="w-full">
      <Alert 
        className={`border-2 ${
          status.aberto 
            ? 'bg-yellow-50 border-yellow-400' 
            : 'bg-red-50 border-red-400'
        }`}
      >
        <AlertDescription className="flex items-center justify-center gap-3">
          {/* Icone no lugar do emoji: acompanha a cor do aviso e nao depende
              da fonte de emoji do aparelho. */}
          <AlertTriangle
            className={`h-6 w-6 shrink-0 ${status.aberto ? 'text-yellow-600' : 'text-red-600'}`}
            aria-hidden="true"
          />
          <div className="text-center">
            <div className={`font-bold text-lg ${
              status.aberto ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {status.aberto ? 'Pedidos Temporariamente Pausados' : 'Restaurante Fechado'}
            </div>
            <div className={`text-sm ${
              status.aberto ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {status.mensagem}
            </div>
            {status.horario_abertura && status.horario_fechamento && (
              <div className="text-sm mt-1 text-gray-600">
                Horário de funcionamento: {status.horario_abertura} às {status.horario_fechamento}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RestaurantStatusBanner;

