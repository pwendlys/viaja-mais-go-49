
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    rating: 5.0
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
          rating: 5.0, // Default rating since it's not in the current schema
          totalRides: 0, // Default since it's not in the current schema
          isAvailable: false // Default since it's not in the current schema
        });
      }

      // Set default stats since we don't have a rides table yet
      setStats({
        totalRides: 0,
        todayEarnings: 0,
        todayRides: 0,
        rating: 5.0
      });

      // Set empty recent rides since we don't have a rides table yet
      setRecentRides([]);

    } catch (error) {
      console.error('Erro ao buscar dados do motorista:', error);
      toast.error('Erro ao carregar dados do motorista');
    } finally {
      setLoading(false);
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
            try {
              // For now, just update the local state since we don't have location fields in the database
              setDriverInfo(prev => prev ? { ...prev, isAvailable: true } : null);
              toast.success('Você está online! Aguardando solicitações...');
              
              console.log('Location obtained:', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            } catch (error) {
              console.error('Erro ao atualizar status:', error);
              toast.error('Erro ao ficar online');
            }
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            let errorMessage = 'Erro ao obter sua localização.';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permissão de localização negada. Permita o acesso à localização.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Localização não disponível.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Tempo limite para obter localização.';
                break;
            }
            
            toast.error(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
          }
        );
      } else {
        // Ficar offline - just update local state for now
        setDriverInfo(prev => prev ? { ...prev, isAvailable: false } : null);
        toast.info('Você está offline');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status online/offline');
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  return {
    driverInfo,
    stats,
    recentRides,
    loading,
    toggleOnlineStatus,
    refreshData: fetchDriverData
  };
};
