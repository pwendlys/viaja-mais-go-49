
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsStats {
  totalUsers: number;
  totalPatients: number;
  totalDrivers: number;
  activeUsers: number;
  patientsWithDependency: number;
  driversCount: number;
}

interface DailyStats {
  date: string;
  newUsers: number;
  newPatients: number;
  newDrivers: number;
}

interface UserTypeStats {
  name: string;
  value: number;
  color: string;
}

export const useAnalyticsData = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    totalPatients: 0,
    totalDrivers: 0,
    activeUsers: 0,
    patientsWithDependency: 0,
    driversCount: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [userTypes, setUserTypes] = useState<UserTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Buscar estatísticas gerais
      const [profilesResult, patientsResult, driversResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('patients').select('*'),
        supabase.from('drivers').select('*')
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (patientsResult.error) throw patientsResult.error;
      if (driversResult.error) throw driversResult.error;

      const profiles = profilesResult.data || [];
      const patients = patientsResult.data || [];
      const drivers = driversResult.data || [];

      // Calcular estatísticas
      const patientsWithDependency = patients.filter(p => p.has_dependency).length;
      const activeUsers = profiles.filter(p => p.is_active).length;

      setStats({
        totalUsers: profiles.length,
        totalPatients: patients.length,
        totalDrivers: drivers.length,
        activeUsers,
        patientsWithDependency,
        driversCount: drivers.length
      });

      // Processar dados diários (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyData = last7Days.map(date => {
        const dayProfiles = profiles.filter(profile => 
          profile.created_at && profile.created_at.startsWith(date)
        );
        const dayPatients = patients.filter(patient => {
          const patientProfile = profiles.find(p => p.id === patient.id);
          return patientProfile?.created_at && patientProfile.created_at.startsWith(date);
        });
        const dayDrivers = drivers.filter(driver => {
          const driverProfile = profiles.find(p => p.id === driver.id);
          return driverProfile?.created_at && driverProfile.created_at.startsWith(date);
        });
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          newUsers: dayProfiles.length,
          newPatients: dayPatients.length,
          newDrivers: dayDrivers.length
        };
      });

      setDailyStats(dailyData);

      // Processar tipos de usuários
      const patientCount = profiles.filter(p => p.user_type === 'patient').length;
      const driverCount = profiles.filter(p => p.user_type === 'driver').length;
      const adminCount = profiles.filter(p => p.user_type === 'admin').length;

      setUserTypes([
        { name: 'Pacientes', value: patientCount, color: '#3b82f6' },
        { name: 'Motoristas', value: driverCount, color: '#10b981' },
        { name: 'Administradores', value: adminCount, color: '#f59e0b' }
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
    ridesByHour: [], // Vazio pois não temos tabela de rides ainda
    topRoutes: [], // Vazio pois não temos tabela de rides ainda
    userTypes,
    isLoading,
    refetchAnalytics: fetchAnalyticsData
  };
};
