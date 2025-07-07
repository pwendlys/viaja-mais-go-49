
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

  const { calculateRoute } = useGoogleMaps();

  const calculateRideEstimate = async ({ origin, destination }: RideCalculationParams): Promise<RideEstimate | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Calcular rota usando Google Maps
      const routeInfo = await calculateRoute(origin, destination);
      
      if (!routeInfo) {
        throw new Error('Não foi possível calcular a rota');
      }

      // Buscar configuração de preços do banco de dados
      const { data: pricingConfig, error: pricingError } = await supabase
        .from('pricing_config')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (pricingError) {
        throw new Error('Erro ao buscar configuração de preços: ' + pricingError.message);
      }

      // Calcular preço
      const distanceKm = routeInfo.distanceValue / 1000;
      const durationMinutes = routeInfo.durationValue / 60;
      
      const baseFare = Number(pricingConfig.base_fare);
      const pricePerKm = Number(pricingConfig.price_per_km);
      const pricePerMinute = Number(pricingConfig.price_per_minute);
      const surgeMultiplier = Number(pricingConfig.surge_multiplier);
      const minimumFare = Number(pricingConfig.minimum_fare);
      
      const calculatedPrice = (baseFare + (distanceKm * pricePerKm) + (durationMinutes * pricePerMinute)) * surgeMultiplier;
      const finalPrice = Math.max(calculatedPrice, minimumFare);

      return {
        distance: distanceKm,
        duration: durationMinutes,
        price: Math.round(finalPrice * 100) / 100,
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
