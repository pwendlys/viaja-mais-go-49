

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
          created_at
        `)
        .eq('user_type', 'driver');

      if (error) throw error;

      // Get driver details for each profile
      const driverIds = data?.map(profile => profile.id) || [];
      let driverDetails: any[] = [];
      
      if (driverIds.length > 0) {
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .in('id', driverIds);

        if (driversError) {
          console.error('Error fetching driver details:', driversError);
        } else {
          driverDetails = driversData || [];
        }
      }

      const formattedDrivers = data?.map(profile => {
        const driverDetail = driverDetails.find(d => d.id === profile.id);
        
        return {
          id: profile.id,
          name: profile.full_name,
          email: '', // Email não está disponível via profiles por segurança
          phone: profile.phone || '',
          status: profile.is_active ? 'Ativo' : 'Inativo',
          vehicle: driverDetail?.vehicle_model || 'N/A',
          plate: driverDetail?.vehicle_plate || 'N/A',
          totalRides: 0, // Default value since we don't have rides table
          rating: 0, // Default value
          earnings: 0, // Default value
          joinDate: profile.created_at,
          documentsStatus: 'Pendente' // Default status
        };
      }) || [];

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

      await fetchDrivers();
      toast.success(`Status do motorista alterado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do motorista');
    }
  };

  const approveDocuments = async (driverId: string, approved: boolean, rejectionReason?: string) => {
    try {
      // Since we don't have user_approvals table, we'll just activate the driver
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

