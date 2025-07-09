
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  vehicle: string;
  plate: string;
  totalRides: number;
  rating: number;
  earnings: number;
  joinDate: string;
  documentsStatus: string;
}

export const useDriversData = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          is_active,
          created_at,
          drivers (
            vehicle_model,
            vehicle_plate,
            total_rides,
            rating
          ),
          user_approvals (
            status
          )
        `)
        .eq('user_type', 'driver');

      if (error) throw error;

      const formattedDrivers = data?.map(profile => ({
        id: profile.id,
        name: profile.full_name,
        email: '', // Email não está disponível via profiles por segurança
        phone: profile.phone || '',
        status: profile.is_active ? 'Ativo' : 'Inativo',
        vehicle: profile.drivers?.[0]?.vehicle_model || 'N/A',
        plate: profile.drivers?.[0]?.vehicle_plate || 'N/A',
        totalRides: profile.drivers?.[0]?.total_rides || 0,
        rating: profile.drivers?.[0]?.rating || 0,
        earnings: 0, // Será calculado dos pagamentos
        joinDate: profile.created_at,
        documentsStatus: profile.user_approvals?.[0]?.status === 'approved' ? 'Aprovado' : 
                        profile.user_approvals?.[0]?.status === 'rejected' ? 'Rejeitado' : 'Pendente'
      })) || [];

      setDrivers(formattedDrivers);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      toast.error('Erro ao carregar motoristas');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDriverStatus = async (driverId: string, newStatus: string) => {
    try {
      const isActive = newStatus === 'Ativo';
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', driverId);

      if (error) throw error;

      // Atualizar também o status de aprovação se necessário
      if (newStatus === 'Ativo') {
        await supabase
          .from('user_approvals')
          .upsert({
            user_id: driverId,
            user_type: 'driver',
            status: 'approved',
            reviewed_at: new Date().toISOString()
          });
      }

      await fetchDrivers();
      toast.success(`Status do motorista alterado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do motorista');
    }
  };

  const approveDocuments = async (driverId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('user_approvals')
        .upsert({
          user_id: driverId,
          user_type: 'driver',
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: approved ? null : rejectionReason
        });

      if (error) throw error;

      // Se aprovado, ativar o motorista
      if (approved) {
        await supabase
          .from('profiles')
          .update({ is_active: true })
          .eq('id', driverId);
      }

      await fetchDrivers();
      toast.success(`Documentos ${approved ? 'aprovados' : 'rejeitados'}`);
    } catch (error) {
      console.error('Erro ao aprovar documentos:', error);
      toast.error('Erro ao processar aprovação');
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return {
    drivers,
    isLoading,
    updateDriverStatus,
    approveDocuments,
    refetchDrivers: fetchDrivers
  };
};
