import React, { useState } from 'react';
import { MapPin, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DeliveryCalculator = ({ onDeliveryFeeCalculated }) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [debugMsg, setDebugMsg] = useState('');

  // Endereço base do restaurante
  const RESTAURANT_ADDRESS = {
    lat: -23.6483853, // Coordenadas EXATAS da Av. Gago Coutinho, 310
    lng: -46.5554242,
    address: 'Av. Gago Coutinho, 310 - Santa Maria, Santo André - SP',
    cep: '09070-000'
  };

  // A tabela de taxas NÃO mora mais aqui.
  //
  // Havia uma cópia dela neste arquivo, em JavaScript, ao lado da original em
  // Python (src/services/delivery_fee.py). Duas cópias da mesma tabela de
  // preços não ficam iguais para sempre, e estas já tinham saído do lugar: o
  // navegador cobrava R$ 35,00 acima de 20km, faixa que não existe no
  // servidor — lá, acima de 20km o pedido é RECUSADO. O cliente distante
  // preenchia tudo, via um frete que a loja não pratica e tomava erro no botão
  // de confirmar.
  //
  // Agora quem responde "quanto custa" é sempre o servidor, pela mesma conta
  // que vai cobrar. O navegador só mede a distância.

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);
    if (limited.length > 5) {
      return `${limited.slice(0, 5)}-${limited.slice(5)}`;
    }
    return limited;
  };

  const handleCepChange = (e) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
    setError('');
    setDeliveryInfo(null);
    setDebugMsg('');
  };

  const validateCEP = (cep) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
  };

  // Função para calcular distância de rota real usando OSRM
  const calculateRouteDistance = async (lat1, lon1, lat2, lon2) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        return data.routes[0].distance / 1000;
      }
      return null;
    } catch (error) {
      console.error('Erro ao calcular rota OSRM:', error);
      return null;
    }
  };

  // Função para calcular distância em linha reta (Haversine)
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Função robusta para obter coordenadas via Nominatim com múltiplas tentativas
  const getCoordinates = async (addressData, cep) => {
    // Estratégias de busca ordenadas da mais específica para a mais genérica
    const strategies = [
      // 1. Logradouro + Bairro + Cidade + UF (Padrão - Mais preciso)
      {
        query: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}, ${addressData.uf}, Brasil`,
        type: 'exact'
      },
      // 2. CEP exato (Prioridade alta pois é único e evita ruas homônimas em bairros errados)
      {
        query: `${cep}, Brasil`,
        type: 'cep'
      },
      // 3. Logradouro + Cidade + UF (Sem bairro - Fallback perigoso para ruas duplicadas)
      {
        query: `${addressData.logradouro}, ${addressData.localidade}, ${addressData.uf}, Brasil`,
        type: 'street_city'
      },
      // 4. Apenas Logradouro + Cidade (Sem UF)
      {
        query: `${addressData.logradouro}, ${addressData.localidade}, Brasil`,
        type: 'street_only'
      }
    ];

    for (const strategy of strategies) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(strategy.query)}&limit=1`, {
          headers: { 'User-Agent': 'JamalEsfiharia/1.0' }
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            matchType: strategy.type,
            displayName: data[0].display_name
          };
        }
      } catch (error) {
        console.error(`Erro na estratégia "${strategy.query}":`, error);
      }
      // Delay para respeitar limite da API
      await new Promise(r => setTimeout(r, 300));
    }

    return null;
  };

  const calculateEstimatedTime = (distance) => {
    if (distance <= 3) return '20-30 min';
    if (distance <= 6) return '30-40 min';
    if (distance <= 10) return '40-50 min';
    if (distance <= 15) return '50-60 min';
    if (distance <= 20) return '60-75 min';
    return '75-90 min';
  };

  /**
   * Pergunta a taxa ao servidor. Devolve { fee, label } ou lança com a
   * mensagem que o próprio servidor deu (é ele quem sabe dizer "acima de 20km,
   * entre em contato").
   *
   * Falha de rede também lança, de propósito: sem resposta do servidor não há
   * taxa para mostrar. Chutar um valor aqui recriaria o bug que este trecho
   * existe para não ter — número na tela que a cobrança não confirma.
   */
  const getFeeByDistance = async (distance) => {
    const resposta = await fetch(
      `${process.env.REACT_APP_API_BASE_URL || '/api'}/delivery/calcular-taxa`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distancia_km: Number(distance.toFixed(1)) }),
      }
    );

    const corpo = await resposta.json();
    const dados = corpo?.data || {};

    if (!resposta.ok || dados.erro) {
      throw new Error(dados.erro || corpo?.message || 'Não foi possível calcular a taxa de entrega.');
    }

    return { fee: dados.taxa, label: dados.faixa };
  };

  const calculateDeliveryFee = async () => {
    if (!validateCEP(cep)) {
      setError('CEP inválido. Digite um CEP válido com 8 dígitos.');
      return;
    }

    setLoading(true);
    setError('');
    setDebugMsg('');

    try {
      // 1. Consulta API ViaCEP
      const cepNumbers = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      // 2. Obter coordenadas com estratégia robusta
      let clientCoords = await getCoordinates(data, cep);
      let isApproximate = false;

      // Se falhar, usar coordenadas aproximadas da cidade (Fallback de segurança)
      if (!clientCoords) {
        isApproximate = true;
        setDebugMsg('Endereço exato não localizado no mapa. Usando referência aproximada.');
        
        const cityCoordinates = {
          'santo andré': { lat: -23.65, lng: -46.55 },
          'são caetano do sul': { lat: -23.6236, lng: -46.5491 },
          'são bernardo do campo': { lat: -23.6914, lng: -46.5650 },
          'mauá': { lat: -23.6678, lng: -46.4614 }
        };
        const city = data.localidade.toLowerCase();
        clientCoords = cityCoordinates[city] || { lat: -23.6631, lng: -46.5292 };
      } else {
        setDebugMsg(`Localizado via: ${clientCoords.matchType === 'exact' ? 'Endereço Completo' : 'Rua/CEP'}`);
      }
      
      // 3. Calcular distância real de rota (OSRM)
      let distance = await calculateRouteDistance(
        RESTAURANT_ADDRESS.lat,
        RESTAURANT_ADDRESS.lng,
        clientCoords.lat,
        clientCoords.lng
      );

      // Se OSRM falhar, usar Haversine com margem de segurança
      if (distance === null) {
        const haversine = calculateHaversineDistance(
          RESTAURANT_ADDRESS.lat,
          RESTAURANT_ADDRESS.lng,
          clientCoords.lat,
          clientCoords.lng
        );
        distance = haversine * 1.3; // +30% margem
      }

      const rateInfo = await getFeeByDistance(distance);
      const estimatedTime = calculateEstimatedTime(distance);

      const fullAddress = `${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade || ''}/${data.uf || ''}`;
      
      const info = {
        address: fullAddress,
        cep: cep,
        fee: rateInfo.fee,
        time: estimatedTime,
        distance: distance.toFixed(1),
        zone: rateInfo.label,
        isApproximate: isApproximate,
        addressData: {
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || ''
        }
      };

      setDeliveryInfo(info);
      
      if (onDeliveryFeeCalculated) {
        onDeliveryFeeCalculated(info);
      }

    } catch (err) {
      // A mensagem do servidor vem na frente quando existe: "Distância acima
      // de 20km, entre em contato" é uma resposta útil, e o texto genérico
      // "Erro ao consultar CEP" mandava o cliente conferir um CEP que estava
      // certo.
      setError(err?.message || 'Erro ao consultar CEP. Tente novamente.');
      console.error('Erro ao calcular entrega:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      calculateDeliveryFee();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Calcular Taxa de Entrega
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Digite seu CEP"
              value={cep}
              onChange={handleCepChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              maxLength={9}
            />
          </div>
          <button
            onClick={calculateDeliveryFee}
            disabled={loading || !cep}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculando...
              </>
            ) : (
              'Calcular'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {deliveryInfo && (
        <div className={`p-4 border rounded-lg space-y-2 ${deliveryInfo.isApproximate ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Endereço:</p>
              <p className="text-sm font-medium text-gray-800">{deliveryInfo.address}</p>
              
            </div>
          </div>
          
          {deliveryInfo.isApproximate && (
            <div className="p-2 bg-yellow-100 rounded text-xs text-yellow-800 mt-2">
              ⚠️ Localização aproximada. A distância pode variar.
            </div>
          )}

          <div className={`grid grid-cols-3 gap-4 mt-3 pt-3 border-t ${deliveryInfo.isApproximate ? 'border-yellow-200' : 'border-green-200'}`}>
            <div>
              <p className="text-xs text-gray-500">Distância</p>
              <p className="text-lg font-bold text-gray-800">{deliveryInfo.distance} km</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Taxa de Entrega</p>
              <p className="text-lg font-bold text-red-600">R$ {deliveryInfo.fee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tempo Estimado</p>
              <p className="text-lg font-bold text-gray-800">{deliveryInfo.time}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-500">Faixa de Distância</p>
            <p className="text-sm font-medium text-gray-700">{deliveryInfo.zone}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCalculator;
