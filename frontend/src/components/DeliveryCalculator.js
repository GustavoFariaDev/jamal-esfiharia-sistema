import React, { useState } from 'react';
import { MapPin, Loader2, AlertTriangle, Navigation, Info } from 'lucide-react';

const DeliveryCalculator = ({ onDeliveryFeeCalculated }) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // --- CONFIGURAÇÃO DA LOJA ---
  const RESTAURANT_ADDRESS = {
    // Coordenadas verificadas para Av. Gago Coutinho, 310, Santo André
    lat: -23.648385, 
    lng: -46.555424,
    address: 'Av. Gago Coutinho, 310 - Santa Maria, Santo André - SP',
    cep: '09070-000'
  };

  const deliveryRates = [
    { maxDistance: 1.5, fee: 3.00, label: 'até 1,5km' },
    { maxDistance: 2.5, fee: 4.00, label: 'até 2,5km' },
    { maxDistance: 3.5, fee: 5.00, label: 'até 3,5km' },
    { maxDistance: 4.5, fee: 6.00, label: 'até 4,5km' },
    { maxDistance: 5.5, fee: 7.00, label: 'até 5,5km' },
    { maxDistance: 6.5, fee: 8.00, label: 'até 6,5km' },
    { maxDistance: 7.5, fee: 9.00, label: 'até 7,5km' },
    { maxDistance: 8.5, fee: 10.00, label: 'até 8,5km' },
    { maxDistance: 9.5, fee: 11.00, label: 'até 9,5km' },
    { maxDistance: 10.0, fee: 13.00, label: 'até 10,0km' },
    { maxDistance: 12.0, fee: 15.00, label: 'até 12,0km' },
    { maxDistance: 13.0, fee: 16.00, label: 'até 13,0km' },
    { maxDistance: 14.0, fee: 18.00, label: 'até 14,0km' },
    { maxDistance: 15.0, fee: 20.00, label: 'até 15,0km' },
    { maxDistance: 16.0, fee: 22.00, label: 'até 16,0km' },
    { maxDistance: 18.0, fee: 25.00, label: 'até 18,0km' },
    { maxDistance: 19.0, fee: 27.00, label: 'até 19,0km' },
    { maxDistance: 20.1, fee: 29.00, label: 'até 20,0km' },
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
  };

  // --- CÁLCULO DE ROTA (OSRM) ---
  // Retorna a distância REAL de direção em km
  const calculateRouteDistance = async (lat1, lon1, lat2, lon2) => {
    try {
      // OSRM espera ordem: longitude, latitude
      const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        // OSRM retorna metros, convertemos para km
        return data.routes[0].distance / 1000;
      }
      return null;
    } catch (error) {
      console.warn('Falha no OSRM, usando fallback:', error);
      return null;
    }
  };

  // --- CÁLCULO MATEMÁTICO (HAVERSINE) ---
  // Usado apenas como fallback se a API de rotas falhar
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightDistance = R * c;
    
    // Multiplicador de 1.4x para compensar curvas de ruas (fator de tortuosidade urbana)
    // Isso aproxima a linha reta da distância real de direção
    return straightDistance * 1.4; 
  };

  // --- GEOCODIFICAÇÃO (NOMINATIM) ---
  const getCoordinates = async (addressData, cepRaw) => {
    const cleanCep = cepRaw.replace(/\D/g, '');
    
    // Limpar logradouro para busca (remove abreviações que confundem o Nominatim)
    // Ex: "R. das Flores" -> "Rua das Flores" ajuda na busca
    const street = addressData.logradouro;
    const city = addressData.localidade;
    const uf = addressData.uf;

    const strategies = [
      // 1. Busca por CEP exato (Melhor para precisão de rua)
      { q: `${cleanCep}, Brasil`, type: 'cep_exact' },
      
      // 2. Logradouro + Cidade + UF
      { q: `${street}, ${city}, ${uf}, Brasil`, type: 'street_full' },
      
      // 3. Logradouro + Cidade (sem UF)
      { q: `${street}, ${city}, Brasil`, type: 'street_city' }
    ];

    for (const strategy of strategies) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(strategy.q)}&limit=1&addressdetails=1`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'JamalDeliveryApp/1.0' } // User-Agent é obrigatório para não ser bloqueado
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            type: strategy.type,
            display: data[0].display_name
          };
        }
      } catch (e) {
        console.log(`Tentativa falhou para ${strategy.q}`);
      }
      // Pequeno delay para não bloquear a API
      await new Promise(r => setTimeout(r, 400));
    }
    return null;
  };

  const calculateDeliveryFee = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido. Digite 8 números.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Dados do endereço via ViaCEP
      const cepResponse = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const addressData = await cepResponse.json();

      if (addressData.erro) {
        throw new Error('CEP não encontrado.');
      }

      // 2. Obter Coordenadas (Latitude/Longitude)
      let coords = await getCoordinates(addressData, cep);
      let calculationMethod = 'route'; // 'route' ou 'fallback'

      // Fallback se não achar coordenadas exatas: usa o centro da cidade (Muito aproximado)
      if (!coords) {
         // Coordenadas centrais de Santo André como fallback final
         coords = { lat: -23.6545, lng: -46.5337, type: 'city_fallback' }; 
         calculationMethod = 'fallback';
      }

      // 3. Calcular Distância
      let distance = await calculateRouteDistance(
        RESTAURANT_ADDRESS.lat,
        RESTAURANT_ADDRESS.lng,
        coords.lat,
        coords.lng
      );

      // Se OSRM falhar (retornar null), usa Haversine com margem de erro
      if (distance === null) {
        distance = calculateHaversineDistance(
          RESTAURANT_ADDRESS.lat,
          RESTAURANT_ADDRESS.lng,
          coords.lat,
          coords.lng
        );
        calculationMethod = 'fallback_math';
      }

      // Arredonda para 1 casa decimal
      const finalDistance = parseFloat(distance.toFixed(1));

      // 4. Determinar Preço
      let rate = deliveryRates.find(r => finalDistance <= r.maxDistance);
      if (!rate) rate = deliveryRates[deliveryRates.length - 1];

      // Formatar endereço para exibição
      const fullAddress = `${addressData.logradouro}, ${addressData.bairro} - ${addressData.localidade}/${addressData.uf}`;

      const resultInfo = {
        address: fullAddress,
        distance: finalDistance,
        fee: rate.fee,
        zone: rate.label,
        method: calculationMethod,
        isApproximate: calculationMethod !== 'route' || coords.type === 'city_fallback'
      };

      setDeliveryInfo(resultInfo);
      if (onDeliveryFeeCalculated) onDeliveryFeeCalculated(resultInfo);

    } catch (err) {
      setError(err.message || 'Erro ao calcular entrega. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') calculateDeliveryFee();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Calculadora de Entrega
        </h3>
        <p className="text-red-100 text-xs mt-1 opacity-90">
          Base: Av. Gago Coutinho, 310 - Santo André
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={cep}
              onChange={handleCepChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite o CEP"
              maxLength={9}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
            />
          </div>
          <button
            onClick={calculateDeliveryFee}
            disabled={loading || cep.length < 9}
            className="px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calcular'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {deliveryInfo && (
          <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
            {/* Endereço Encontrado */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Destino</p>
              <p className="text-sm text-gray-800 font-medium leading-tight">
                {deliveryInfo.address}
              </p>
            </div>

            {/* Warning se for aproximado */}
            {deliveryInfo.isApproximate && (
              <div className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Não conseguimos a localização exata do número da casa. 
                  A distância calculada é uma estimativa aproximada.
                </span>
              </div>
            )}

            {/* Cards de Resultado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Distância</span>
                <span className="text-2xl font-bold text-gray-900">{deliveryInfo.distance} km</span>
                <span className="text-xs text-gray-500 mt-1">
                  {deliveryInfo.method === 'route' ? 'Rota de carro' : 'Linha reta aprox.'}
                </span>
              </div>

              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Taxa de Entrega</span>
                <span className="text-2xl font-bold text-gray-900">
                  R$ {deliveryInfo.fee.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-gray-500 mt-1">{deliveryInfo.zone}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryCalculator;
