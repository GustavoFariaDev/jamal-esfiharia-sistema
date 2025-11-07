import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const DeliveryCalculator = ({ onDeliveryFeeCalculated }) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

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
    { maxDistance: 10.5, fee: 13.00, label: '10km' },
    { maxDistance: 12.5, fee: 15.00, label: '12km' },
    { maxDistance: 13.5, fee: 16.00, label: '13km' },
    { maxDistance: 14.5, fee: 18.00, label: '14km' },
    { maxDistance: 15.5, fee: 20.00, label: '15km' },
    { maxDistance: 16.5, fee: 22.00, label: '16km' },
    { maxDistance: 18.5, fee: 25.00, label: '18km' },
    { maxDistance: 19.5, fee: 27.00, label: '19km' },
    { maxDistance: 20.5, fee: 29.00, label: '20km' },
    { maxDistance: 999, fee: 35.00, label: 'Acima de 20km' }
  ];

  const formatCEP = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Limita a 8 dígitos
    const limited = numbers.slice(0, 8);
    // Adiciona o hífen após 5 dígitos
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
  };

  const validateCEP = (cep) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
  };

  // Função para calcular distância entre duas coordenadas (fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Função para estimar coordenadas baseado no CEP (aproximação por região)
  const estimateCoordinatesByCEP = (cep, addressData) => {
    const cepNum = parseInt(cep.replace(/\D/g, ''));
    
    // Mapeamento aproximado de CEPs da região de São Paulo/ABC
    // Santo André: 09000-000 a 09999-999
    // São Paulo (zonas próximas): 01000-000 a 05999-999
    
    // Se temos dados do ViaCEP com localidade, podemos fazer uma estimativa melhor
    if (addressData.localidade) {
      const cidade = addressData.localidade.toLowerCase();
      const uf = addressData.uf.toLowerCase();
      
      // Coordenadas aproximadas de cidades da região
      const cityCoordinates = {
        'santo andré': { lat: -23.6631, lng: -46.5292 },
        'são paulo': { lat: -23.5505, lng: -46.6333 },
        'são bernardo do campo': { lat: -23.6914, lng: -46.5650 },
        'são caetano do sul': { lat: -23.6236, lng: -46.5491 },
        'diadema': { lat: -23.6858, lng: -46.6228 },
        'mauá': { lat: -23.6678, lng: -46.4614 },
        'ribeirão pires': { lat: -23.7083, lng: -46.4133 },
        'rio grande da serra': { lat: -23.7444, lng: -46.3986 }
      };
      
      if (cityCoordinates[cidade]) {
        return cityCoordinates[cidade];
      }
    }
    
    // Estimativa por faixa de CEP (São Paulo)
    if (cepNum >= 1000000 && cepNum <= 5999999) {
      // Região central de São Paulo - varia de 2 a 8 km
      const variation = (cepNum % 1000) / 1000;
      return {
        lat: -23.5505 + (variation * 0.1 - 0.05),
        lng: -46.6333 + (variation * 0.1 - 0.05)
      };
    } else if (cepNum >= 9000000 && cepNum <= 9099999) {
      // Santo André - varia de 0.5 a 5 km
      const variation = (cepNum % 1000) / 1000;
      return {
        lat: -23.6631 + (variation * 0.08 - 0.04),
        lng: -46.5292 + (variation * 0.08 - 0.04)
      };
    } else {
      // Outras regiões - estimativa mais distante
      return {
        lat: -23.5505 + ((cepNum % 10000) / 10000 * 0.3 - 0.15),
        lng: -46.6333 + ((cepNum % 10000) / 10000 * 0.3 - 0.15)
      };
    }
  };

  // Função para calcular tempo estimado baseado na distância
  const calculateEstimatedTime = (distance) => {
    if (distance <= 3) return '20-30 min';
    if (distance <= 6) return '30-40 min';
    if (distance <= 10) return '40-50 min';
    if (distance <= 15) return '50-60 min';
    if (distance <= 20) return '60-75 min';
    return '75-90 min';
  };

  // Função para determinar taxa baseada na distância
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

    try {
      // Consulta API ViaCEP
      const cepNumbers = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      // Estima coordenadas do endereço do cliente
      const clientCoords = estimateCoordinatesByCEP(cepNumbers, data);
      
      // Calcula distância entre restaurante e cliente
      const distance = calculateDistance(
        RESTAURANT_ADDRESS.lat,
        RESTAURANT_ADDRESS.lng,
        clientCoords.lat,
        clientCoords.lng
      );

      // Determina taxa baseada na distância
      const rateInfo = getFeeByDistance(distance);
      const estimatedTime = calculateEstimatedTime(distance);

      const info = {
        address: `${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade || ''}/${data.uf || ''}`,
        cep: cep,
        fee: rateInfo.fee,
        time: estimatedTime,
        distance: distance.toFixed(1),
        zone: rateInfo.label
      };

      setDeliveryInfo(info);
      
      // Notifica o componente pai sobre a taxa calculada
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {deliveryInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Endereço:</p>
              <p className="text-sm font-medium text-gray-800">{deliveryInfo.address}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-green-200">
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

      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Taxas de entrega por distância:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2">
          <div>• 0km a 1,5km: R$ 3,00</div>
          <div>• 1,5km a 2,5km: R$ 4,00</div>
          <div>• 2,5km a 3,5km: R$ 5,00</div>
          <div>• 3,5km a 4,5km: R$ 6,00</div>
          <div>• 4,5km a 5,5km: R$ 7,00</div>
          <div>• 5,5km a 6,5km: R$ 8,00</div>
          <div>• 6,5km a 7,5km: R$ 9,00</div>
          <div>• 7,5km a 8,5km: R$ 10,00</div>
          <div>• 8,5km a 9,5km: R$ 11,00</div>
          <div>• 10km: R$ 13,00</div>
          <div>• 12km: R$ 15,00</div>
          <div>• 13km: R$ 16,00</div>
          <div>• 14km: R$ 18,00</div>
          <div>• 15km: R$ 20,00</div>
          <div>• 16km: R$ 22,00</div>
          <div>• 18km: R$ 25,00</div>
          <div>• 19km: R$ 27,00</div>
          <div>• 20km: R$ 29,00</div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCalculator;

