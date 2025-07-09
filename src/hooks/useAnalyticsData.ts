
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsStats {
  totalRevenue: number;
  totalRides: number;
  activeUsers: number;
  activeDrivers: number;
  avgRating: number;
  completionRate: number;
}

interface DailyStats {
  date: string;
  rides: number;
  revenue: number;
  users: number;
}

interface RidesByHour {
  hour: string;
  rides: number;
}

interface TopRoute {
  route: string;
  rides: number;
  revenue: number;
}

interface UserTypeStats {
  name: string;
  value: number;
  color: string;
}

export const useAnalyticsData = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    totalRides: 0,
    activeUsers: 0,
    activeDrivers: 0,
    avgRating: 0,
    completionRate: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [ridesByHour, setRidesByHour] = useState<RidesByHour[]>([]);
  const [topRoutes, setTopRoutes] = useState<TopRoute[]>([]);
  const [userTypes, setUserTypes] = useState<UserTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Buscar estatísticas gerais
      const [ridesResult, usersResult, driversResult] = await Promise.all([
        supabase.from('rides').select('*'),
        supabase.from('profiles').select('*').eq('user_type', 'patient'),
        supabase.from('profiles').select('*').eq('user_type', 'driver')
      ]);

      if (ridesResult.error) throw ridesResult.error;
      if (usersResult.error) throw usersResult.error;
      if (driversResult.error) throw driversResult.error;

      const rides = ridesResult.data || [];
      const users = usersResult.data || [];
      const drivers = driversResult.data || [];

      // Calcular estatísticas
      const completedRides = rides.filter(r => r.status === 'completed');
      const totalRevenue = completedRides.reduce((sum, ride) => sum + (ride.price || 0), 0);
      const avgRating = completedRides.length > 0 
        ? completedRides.reduce((sum, ride) => sum + (ride.driver_rating || 5), 0) / completedRides.length 
        : 0;
      const completionRate = rides.length > 0 
        ? (completedRides.length / rides.length) * 100 
        : 0;

      setStats({
        totalRevenue,
        totalRides: rides.length,
        activeUsers: users.filter(u => u.is_active).length,
        activeDrivers: drivers.filter(d => d.is_active).length,
        avgRating: Number(avgRating.toFixed(1)),
        completionRate: Number(completionRate.toFixed(1))
      });

      // Processar dados diários (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyData = last7Days.map(date => {
        const dayRides = rides.filter(ride => 
          ride.created_at && ride.created_at.startsWith(date)
        );
        const dayRevenue = dayRides
          .filter(r => r.status === 'completed')
          .reduce((sum, ride) => sum + (ride.price || 0), 0);
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          rides: dayRides.length,
          revenue: dayRevenue,
          users: dayRides.filter((ride, index, arr) => 
            arr.findIndex(r => r.patient_id === ride.patient_id) === index
          ).length
        };
      });

      setDailyStats(dailyData);

      // Processar corridas por horário
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourRides = rides.filter(ride => {
          if (!ride.created_at) return false;
          const rideHour = new Date(ride.created_at).getHours();
          return rideHour === hour;
        });
        
        return {
          hour: `${hour.toString().padStart(2, '0')}h`,
          rides: hourRides.length
        };
      }).filter(data => data.rides > 0);

      setRidesByHour(hourlyData);

      // Processar rotas mais populares
      const routeMap = new Map<string, { rides: number; revenue: number }>();
      
      rides.forEach(ride => {
        const route = `${ride.origin_address?.split(',')[0] || 'Origem'} → ${ride.destination_address?.split(',')[0] || 'Destino'}`;
        const existing = routeMap.get(route) || { rides: 0, revenue: 0 };
        routeMap.set(route, {
          rides: existing.rides + 1,
          revenue: existing.revenue + (ride.status === 'completed' ? (ride.price || 0) : 0)
        });
      });

      const topRoutesData = Array.from(routeMap.entries())
        .map(([route, data]) => ({ route, ...data }))
        .sort((a, b) => b.rides - a.rides)
        .slice(0, 5);

      setTopRoutes(topRoutesData);

      // Processar tipos de usuários
      const patientProfiles = await supabase
        .from('patients')
        .select('preferred_vehicle_type')
        .in('id', users.map(u => u.id));

      const vehicleTypeCount = {
        tradicional: 0,
        acessivel: 0,
        indefinido: 0
      };

      patientProfiles.data?.forEach(patient => {
        if (patient.preferred_vehicle_type === 'tradicional') {
          vehicleTypeCount.tradicional++;
        } else if (patient.preferred_vehicle_type === 'acessivel') {
          vehicleTypeCount.acessivel++;
        } else {
          vehicleTypeCount.indefinido++;
        }
      });

      setUserTypes([
        { name: 'Preferem Tradicional', value: vehicleTypeCount.tradicional, color: '#3b82f6' },
        { name: 'Preferem Acessível', value: vehicleTypeCount.acessivel, color: '#10b981' },
        { name: 'Sem Preferência', value: vehicleTypeCount.indefinido, color: '#f59e0b' }
      ]);

    } catch (error) {
      console.error('Erro ao buscar dados do analytics:', error);
      toast.error('Erro ao carregar dados do analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return {
    stats,
    dailyStats,
    ridesByHour,
    topRoutes,
    userTypes,
    isLoading,
    refetchAnalytics: fetchAnalyticsData
  };
};
