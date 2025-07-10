
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RideHistoryItem, RideHistoryFilters, RideHistoryStats } from '@/types/rideHistory';

export const useRideHistory = () => {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRideHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ride_history')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      
      setRides(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico de viagens');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterRides = useCallback((rides: RideHistoryItem[], filters: RideHistoryFilters) => {
    let filtered = rides;

    // Filtro por busca de texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ride =>
        ride.origin_address.toLowerCase().includes(searchLower) ||
        ride.destination_address.toLowerCase().includes(searchLower) ||
        ride.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(ride => ride.status === filters.status);
    }

    // Filtro por tipo de transporte
    if (filters.transportType !== 'all') {
      filtered = filtered.filter(ride => ride.transport_type === filters.transportType);
    }

    // Filtro por data
    if (filters.dateFrom) {
      filtered = filtered.filter(ride => 
        new Date(ride.scheduled_date) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(ride => 
        new Date(ride.scheduled_date) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }, []);

  const getStats = useCallback((rides: RideHistoryItem[]): RideHistoryStats => {
    const total = rides.length;
    const completed = rides.filter(r => r.status === 'completed').length;
    const scheduled = rides.filter(r => r.status === 'scheduled' || r.status === 'confirmed').length;
    const cancelled = rides.filter(r => r.status === 'cancelled').length;
    
    const ratingsWithValues = rides
      .filter(r => r.service_rating)
      .map(r => r.service_rating!);
    
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
      : undefined;

    const totalDistance = rides
      .filter(r => r.distance_km)
      .reduce((sum, ride) => sum + (ride.distance_km || 0), 0);

    return {
      total,
      completed,
      scheduled,
      cancelled,
      averageRating,
      totalDistance: totalDistance > 0 ? totalDistance : undefined
    };
  }, []);

  const cancelRide = useCallback(async (rideId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('ride_history')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason || 'Cancelado pelo usuário'
        })
        .eq('id', rideId);

      if (error) throw error;
      
      // Atualizar o estado local
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, status: 'cancelled' as const, cancellation_reason: reason || 'Cancelado pelo usuário' }
            : ride
        )
      );
      
      toast.success('Viagem cancelada com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao cancelar viagem:', err);
      toast.error('Erro ao cancelar viagem');
      return false;
    }
  }, []);

  const rateService = useCallback(async (rideId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('ride_history')
        .update({ service_rating: rating })
        .eq('id', rideId);

      if (error) throw error;
      
      // Atualizar o estado local
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, service_rating: rating }
            : ride
        )
      );
      
      toast.success('Avaliação enviada com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao avaliar serviço:', err);
      toast.error('Erro ao enviar avaliação');
      return false;
    }
  }, []);

  const rateDriver = useCallback(async (rideId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('ride_history')
        .update({ driver_rating: rating })
        .eq('id', rideId);

      if (error) throw error;
      
      // Atualizar o estado local
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, driver_rating: rating }
            : ride
        )
      );
      
      toast.success('Avaliação do motorista enviada com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao avaliar motorista:', err);
      toast.error('Erro ao enviar avaliação do motorista');
      return false;
    }
  }, []);

  const exportHistory = useCallback(async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      // Implementação futura para exportação
      toast.info('Funcionalidade de exportação será implementada em breve');
    } catch (err) {
      console.error('Erro ao exportar histórico:', err);
      toast.error('Erro ao exportar histórico');
    }
  }, []);

  useEffect(() => {
    fetchRideHistory();
  }, [fetchRideHistory]);

  return {
    rides,
    loading,
    error,
    fetchRideHistory,
    filterRides,
    getStats,
    cancelRide,
    rateService,
    rateDriver,
    exportHistory
  };
};
