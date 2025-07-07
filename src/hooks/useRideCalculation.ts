
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleMaps } from './useGoogleMaps';

interface RideCalculationParams {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

interface RideEstimate {
  distance: number;
  duration: number;
  price: number;
  distanceText: string;
  durationText: string;
}

export const useRideCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { calculateRoute } = useGoogleMaps({
    apiKey: 'YOUR_API_KEY_HERE', // Será substituído pela chave real
    libraries: ['places'],
  });

  const calculateRideEstimate = async ({ origin, destination }: RideCalculationParams): Promise<RideEstimate | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Calcular rota usando Google Maps
      const routeInfo = await calculateRoute(origin, destination);
      
      if (!routeInfo) {
        throw new Error('Não foi possível calcular a rota');
      }

      // Buscar taxas do banco de dados
      const { data: taxas, error: taxasError } = await supabase
        .from('taxas')
        .select('*')
        .limit(1)
        .single();

      if (taxasError) {
        throw new Error('Erro ao buscar taxas: ' + taxasError.message);
      }

      // Calcular preço
      const distanceKm = routeInfo.distanceValue / 1000;
      const durationMinutes = routeInfo.durationValue / 60;
      
      const basePrice = Number(taxas.taxa_base);
      const pricePerKm = Number(taxas.preco_por_km);
      const pricePerMinute = Number(taxas.preco_por_minuto);
      const dynamicRate = Number(taxas.taxa_dinamica);
      
      const totalPrice = (basePrice + (distanceKm * pricePerKm) + (durationMinutes * pricePerMinute)) * dynamicRate;

      return {
        distance: distanceKm,
        duration: durationMinutes,
        price: Math.round(totalPrice * 100) / 100,
        distanceText: routeInfo.distance,
        durationText: routeInfo.duration,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao calcular estimativa:', err);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateRideEstimate,
    isCalculating,
    error,
  };
};
