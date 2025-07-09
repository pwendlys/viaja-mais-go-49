
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { healthTransportApi } from '@/services/healthTransportApi';
import { toast } from 'sonner';

interface DriverStats {
  totalRides: number;
  todayEarnings: number;
  todayRides: number;
  rating: number;
}

interface DriverInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vehicle: {
    model: string;
    plate: string;
    year?: number;
    color?: string;
  };
  rating: number;
  totalRides: number;
  isAvailable: boolean;
}

interface RecentRide {
  id: string;
  patientName: string;
  originAddress: string;
  destinationAddress: string;
  completedAt: string;
  price: number;
  patientRating?: number;
}

export const useDriverData = () => {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [stats, setStats] = useState<DriverStats>({
    totalRides: 0,
    todayEarnings: 0,
    todayRides: 0,
    rating: 0
  });
  const [recentRides, setRecentRides] = useState<RecentRide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDriverData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Buscar perfil do motorista
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('user_type', 'driver')
        .single();

      if (!profile) {
        toast.error('Perfil de motorista não encontrado');
        return;
      }

      // Buscar dados específicos do motorista
      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (driverData) {
        setDriverInfo({
          id: user.id,
          name: profile.full_name,
          email: user.email || '',
          phone: profile.phone,
          vehicle: {
            model: driverData.vehicle_model,
            plate: driverData.vehicle_plate,
            year: driverData.vehicle_year,
            color: driverData.vehicle_color
          },
          rating: driverData.rating || 5.0,
          totalRides: driverData.total_rides || 0,
          isAvailable: driverData.is_available || false
        });
      }

      // Buscar estatísticas e corridas recentes
      await Promise.all([
        fetchDriverStats(user.id),
        fetchRecentRides(user.id)
      ]);

    } catch (error) {
      console.error('Erro ao buscar dados do motorista:', error);
      toast.error('Erro ao carregar dados do motorista');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverStats = async (driverId: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: rides } = await supabase
        .from('rides')
        .select('price, completed_at, status')
        .eq('driver_id', driverId)
        .eq('status', 'completed');

      if (rides) {
        const todayRides = rides.filter(ride => 
          new Date(ride.completed_at) >= today
        );

        const todayEarnings = todayRides.reduce((sum, ride) => 
          sum + (ride.price || 0), 0
        );

        // Calcular avaliação média
        const { data: ratingsData } = await supabase
          .from('rides')
          .select('patient_rating')
          .eq('driver_id', driverId)
          .not('patient_rating', 'is', null);

        let avgRating = 5.0;
        if (ratingsData && ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, ride) => 
            sum + (ride.patient_rating || 0), 0
          );
          avgRating = totalRating / ratingsData.length;
        }

        setStats({
          totalRides: rides.length,
          todayEarnings,
          todayRides: todayRides.length,
          rating: avgRating
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchRecentRides = async (driverId: string) => {
    try {
      const { data: rides } = await supabase
        .from('rides')
        .select(`
          id,
          origin_address,
          destination_address,
          completed_at,
          price,
          patient_rating,
          profiles!rides_patient_id_fkey (full_name)
        `)
        .eq('driver_id', driverId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (rides) {
        const formattedRides: RecentRide[] = rides.map(ride => ({
          id: ride.id,
          patientName: (ride.profiles as any)?.full_name || 'Paciente',
          originAddress: ride.origin_address,
          destinationAddress: ride.destination_address,
          completedAt: ride.completed_at,
          price: ride.price || 0,
          patientRating: ride.patient_rating
        }));

        setRecentRides(formattedRides);
      }
    } catch (error) {
      console.error('Erro ao buscar corridas recentes:', error);
    }
  };

  const toggleOnlineStatus = async (isOnline: boolean) => {
    if (!driverInfo) return;

    try {
      if (isOnline) {
        // Solicitar localização atual
        if (!navigator.geolocation) {
          toast.error('Geolocalização não suportada neste navegador');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Atualizar localização e status no banco
            await healthTransportApi.updateDriverLocation(driverInfo.id, latitude, longitude);
            await healthTransportApi.toggleDriverAvailability(driverInfo.id, true);
            
            setDriverInfo(prev => prev ? { ...prev, isAvailable: true } : null);
            toast.success('Você está online! Aguardando solicitações...');
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            toast.error('Erro ao obter sua localização. Permita o acesso à localização.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
          }
        );
      } else {
        // Ficar offline
        await healthTransportApi.toggleDriverAvailability(driverInfo.id, false);
        setDriverInfo(prev => prev ? { ...prev, isAvailable: false } : null);
        toast.info('Você está offline');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status online/offline');
    }
  };

  const updateLocationPeriodically = () => {
    if (!driverInfo?.isAvailable) return;

    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await healthTransportApi.updateDriverLocation(driverInfo.id, latitude, longitude);
            } catch (error) {
              console.error('Erro ao atualizar localização:', error);
            }
          },
          (error) => {
            console.error('Erro ao obter localização periódica:', error);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      }
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  useEffect(() => {
    const cleanup = updateLocationPeriodically();
    return cleanup;
  }, [driverInfo?.isAvailable]);

  return {
    driverInfo,
    stats,
    recentRides,
    loading,
    toggleOnlineStatus,
    refreshData: fetchDriverData
  };
};
