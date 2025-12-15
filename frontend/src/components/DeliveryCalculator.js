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
    lat: -23.6631, // Coordenadas aproximadas de Santo André
    lng: -46.5292,
    address: 'Av. Gago Coutinho, 310 - Santa Maria, Santo André - SP',
    cep: '09070-000'
  };

  // Tabela de taxas de entrega por distância (em km)
  const deliveryRates = [
    { maxDistance: 1.5, fee: 3.00, label: '0km a 1,5km' },
    { maxDistance: 2.5, fee: 4.00, label: '1,5km a 2,5km' },
    { maxDistance: 3.5, fee: 5.00, label: '2,5km a 3,5km' },
    { maxDistance: 4.5, fee: 6.00, label: '3,5km a 4,5km' },
    { maxDistance: 5.5, fee: 7.00, label: '4,5km a 5,5km' },
    { maxDistance: 6.5, fee: 8.00, label: '5,5km a 6,5km' },
    { maxDistance: 7.5, fee: 9.00, label: '6,5km a 7,5km' },
    { maxDistance: 8.5, fee: 10.00, label: '7,5km a 8,5km' },
    { maxDistance: 9.5, fee: 11.00, label: '8,5km a 9,5km' },
    { maxDistance: 10.0, fee: 13.00, label: '9,5km a 10,0km' },
    { maxDistance: 12.0, fee: 15.00, label: '10,0km a 12,0km' },
    { maxDistance: 13.0, fee: 16.00, label: '12,0km a 13,0km' },
    { maxDistance: 14.0, fee: 18.00, label: '13,0km a 14,0km' },
    { maxDistance: 15.0, fee: 20.00, label: '14,0km a 15,0km' },
    { maxDistance: 16.0, fee: 22.00, label: '15,0km a 16,0km' },
    { maxDistance: 18.0, fee: 25.00, label: '16,0km a 18,0km' },
    { maxDistance: 19.0, fee: 27.00, label: '18,0km a 19,0km' },
    { maxDistance: 20.1, fee: 29.00, label: '19,0km a 20,0km' },
    { maxDistance: 999, fee: 35.00, label: 'Acima de 20km' }
  ];

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
      // 1. Logradouro + Bairro + Cidade + UF (Padrão)
      {
        query: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}, ${addressData.uf}, Brasil`,
        type: 'exact'
      },
      // 2. Logradouro + Cidade + UF (Sem bairro - muitas vezes o bairro confunde)
      {
        query: `${addressData.logradouro}, ${addressData.localidade}, ${addressData.uf}, Brasil`,
        type: 'street_city'
      },
      // 3. Apenas Logradouro + Cidade (Sem UF)
      {
        query: `${addressData.logradouro}, ${addressData.localidade}, Brasil`,
        type: 'street_only'
      },
      // 4. CEP exato (Nominatim as vezes acha pelo CEP)
      {
        query: `${cep}, Brasil`,
        type: 'cep'
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

  const getFeeByDistance = (distance) => {
    for (let rate of deliveryRates) {
      if (distance <= rate.maxDistance) {
        return rate;
      }
    }
    return deliveryRates[deliveryRates.length - 1];
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

      const rateInfo = getFeeByDistance(distance);
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
      setError('Erro ao consultar CEP. Tente novamente.');
      console.error('Erro ao buscar CEP:', err);
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
