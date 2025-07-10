import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchingCriteria {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  vehicleType?: string;
  maxDistance?: number;
  urgency?: 'low' | 'medium' | 'high';
}

interface DriverMatch {
  id: string;
  name: string;
  rating: number;
  distance: number;
  estimatedTime: number;
  vehicle: {
    model: string;
    plate: string;
    type: string;
  };
  totalRides: number;
}

export const useRideMatching = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<DriverMatch[]>([]);

  const findNearbyDrivers = useCallback(async (criteria: MatchingCriteria): Promise<DriverMatch[]> => {
    setIsSearching(true);
    
    try {
      console.log('Searching for drivers with criteria:', criteria);

      // Buscar motoristas disponíveis próximos com join manual
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(`
          id,
          vehicle_model,
          vehicle_plate,
          vehicle_type,
          rating,
          total_rides,
          current_lat,
          current_lng
        `)
        .eq('is_available', true)
        .not('current_lat', 'is', null)
        .not('current_lng', 'is', null);

      if (error) throw error;

      if (!drivers || drivers.length === 0) {
        toast.error('Nenhum motorista disponível encontrado no momento.');
        return [];
      }

      // Buscar nomes dos motoristas separadamente
      const driverIds = drivers.map(d => d.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', driverIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Calcular distâncias e tempos estimados
      const driversWithDistance = await Promise.all(
        drivers.map(async (driver) => {
          // Usar a função calculate_distance do banco de dados
          const { data: distanceResult } = await supabase
            .rpc('calculate_distance', {
              lat1: criteria.origin.lat,
              lng1: criteria.origin.lng,
              lat2: driver.current_lat,
              lng2: driver.current_lng
            });

          const distance = distanceResult || 0;
          const estimatedTime = Math.round((distance / 0.5) * 60); // Assumindo 30km/h velocidade média

          return {
            id: driver.id,
            name: profilesMap.get(driver.id) || 'Motorista',
            rating: driver.rating || 5.0,
            distance,
            estimatedTime,
            vehicle: {
              model: driver.vehicle_model,
              plate: driver.vehicle_plate,
              type: driver.vehicle_type || 'economico'
            },
            totalRides: driver.total_rides || 0
          } as DriverMatch;
        })
      );

      // Filtrar por distância máxima e tipo de veículo
      let filteredDrivers = driversWithDistance.filter(driver => {
        const maxDist = criteria.maxDistance || 20; // 20km por padrão
        const matchesDistance = driver.distance <= maxDist;
        const matchesVehicleType = !criteria.vehicleType || 
          driver.vehicle.type === criteria.vehicleType ||
          criteria.vehicleType === 'economico'; // Economico aceita qualquer tipo

        return matchesDistance && matchesVehicleType;
      });

      // Algoritmo de ordenação inteligente
      filteredDrivers = filteredDrivers.sort((a, b) => {
        // Calcular score baseado em múltiplos fatores
        const urgencyWeight = criteria.urgency === 'high' ? 2 : criteria.urgency === 'medium' ? 1.5 : 1;
        
        const scoreA = calculateDriverScore(a, urgencyWeight);
        const scoreB = calculateDriverScore(b, urgencyWeight);
        
        return scoreB - scoreA; // Ordem decrescente (melhor score primeiro)
      });

      console.log(`Found ${filteredDrivers.length} available drivers`);
      setAvailableDrivers(filteredDrivers);
      
      return filteredDrivers;

    } catch (error) {
      console.error('Error finding drivers:', error);
      toast.error('Erro ao buscar motoristas disponíveis.');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const calculateDriverScore = (driver: DriverMatch, urgencyWeight: number): number => {
    // Fatores para o score:
    // 1. Distância (mais próximo = melhor)
    // 2. Rating (maior = melhor)
    // 3. Experiência (mais corridas = melhor)
    // 4. Urgência (afeta peso da distância)

    const distanceScore = Math.max(0, 10 - driver.distance) * urgencyWeight;
    const ratingScore = driver.rating * 2;
    const experienceScore = Math.min(5, driver.totalRides / 20); // Max 5 pontos para experiência
    
    return distanceScore + ratingScore + experienceScore;
  };

  const requestRide = async (
    driverId: string,
    rideData: {
      origin: { lat: number; lng: number; address: string };
      destination: { lat: number; lng: number; address: string };
      notes?: string;
      medicalNotes?: string;
      appointmentType?: string;
    }
  ) => {
    try {
      console.log('Creating ride request for driver:', driverId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calcular preço estimado
      const { data: distance } = await supabase
        .rpc('calculate_distance', {
          lat1: rideData.origin.lat,
          lng1: rideData.origin.lng,
          lat2: rideData.destination.lat,
          lng2: rideData.destination.lng
        });

      // Buscar configuração de preços
      const { data: pricing } = await supabase
        .from('pricing_config')
        .select('*')
        .eq('is_active', true)
        .eq('vehicle_type', 'economico') // ou baseado na preferência do usuário
        .single();

      const estimatedPrice = pricing ? 
        (pricing.base_fare + (distance * pricing.price_per_km)) : 
        10.00;

      // Criar a corrida
      const { data: ride, error } = await supabase
        .from('rides')
        .insert({
          patient_id: user.id,
          driver_id: driverId,
          origin_address: rideData.origin.address,
          origin_lat: rideData.origin.lat,
          origin_lng: rideData.origin.lng,
          destination_address: rideData.destination.address,
          destination_lat: rideData.destination.lat,
          destination_lng: rideData.destination.lng,
          distance_km: distance,
          price: estimatedPrice,
          status: 'assigned',
          notes: rideData.notes,
          medical_notes: rideData.medicalNotes,
          appointment_type: rideData.appointmentType
        })
        .select()
        .single();

      if (error) throw error;

      // Enviar notificação para o motorista
      await supabase.functions.invoke('realtime-notifications', {
        body: {
          type: 'ride_accepted',
          patientId: user.id,
          driverId,
          rideId: ride.id,
          message: 'Nova corrida aceita!',
          data: {
            origin: rideData.origin,
            destination: rideData.destination,
            estimatedPrice
          }
        }
      });

      toast.success('Corrida solicitada com sucesso!');
      return ride;

    } catch (error) {
      console.error('Error requesting ride:', error);
      toast.error('Erro ao solicitar corrida.');
      throw error;
    }
  };

  return {
    isSearching,
    availableDrivers,
    findNearbyDrivers,
    requestRide
  };
};
