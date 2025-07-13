
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeStats {
  totalPatients: number;
  totalDrivers: number;
  totalProfiles: number;
  activeProfiles: number;
}

export const useAdminRealtime = (isAdmin: boolean) => {
  const [stats, setStats] = useState<RealtimeStats>({
    totalPatients: 0,
    totalDrivers: 0,
    totalProfiles: 0,
    activeProfiles: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    console.log('Setting up admin realtime connections...');

    // Função para buscar estatísticas atualizadas
    const fetchStats = async () => {
      try {
        const [patientsCount, driversCount, profilesCount, activeProfilesCount] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('drivers').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true)
        ]);

        setStats({
          totalPatients: patientsCount.count || 0,
          totalDrivers: driversCount.count || 0,
          totalProfiles: profilesCount.count || 0,
          activeProfiles: activeProfilesCount.count || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    // Buscar dados iniciais
    fetchStats();

    // Configurar canais de realtime
    const channels = [
      supabase
        .channel('admin-patients')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'patients'
        }, (payload) => {
          console.log('Patients change:', payload);
          fetchStats();
          toast.info('Atualização: Novos dados de pacientes');
        }),

      supabase
        .channel('admin-drivers')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'drivers'
        }, (payload) => {
          console.log('Drivers change:', payload);
          fetchStats();
          toast.info('Atualização: Novos dados de motoristas');
        }),

      supabase
        .channel('admin-profiles')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, (payload) => {
          console.log('Profiles change:', payload);
          fetchStats();
          toast.info('Atualização: Novos usuários');
        })
    ];

    // Subscrever todos os canais
    channels.forEach(channel => {
      channel.subscribe((status) => {
        console.log(`Admin channel ${channel.topic} status:`, status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });
    });

    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [isAdmin]);

  return {
    stats,
    isConnected,
    refreshStats: async () => {
      // Função para atualizar manualmente as estatísticas
      try {
        const [patientsCount, driversCount, profilesCount, activeProfilesCount] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('drivers').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true)
        ]);

        setStats({
          totalPatients: patientsCount.count || 0,
          totalDrivers: driversCount.count || 0,
          totalProfiles: profilesCount.count || 0,
          activeProfiles: activeProfilesCount.count || 0
        });
        
        toast.success('Estatísticas atualizadas!');
      } catch (error) {
        console.error('Error refreshing stats:', error);
        toast.error('Erro ao atualizar estatísticas');
      }
    }
  };
};
