
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalRides: number;
  rating: number;
  joinDate: string;
  lastActivity: string;
  address: string;
  susNumber: string;
}

export const usePatientsData = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          is_active,
          created_at,
          patients (
            address,
            sus_number
          ),
          user_approvals (
            status
          )
        `)
        .eq('user_type', 'patient');

      if (error) throw error;

      // Buscar estatísticas de corridas para cada paciente
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('patient_id, status, patient_rating, created_at');

      if (ridesError) throw ridesError;

      const formattedPatients = data?.map(profile => {
        const userRides = ridesData?.filter(ride => ride.patient_id === profile.id) || [];
        const completedRides = userRides.filter(ride => ride.status === 'completed');
        const avgRating = completedRides.length > 0 
          ? completedRides.reduce((sum, ride) => sum + (ride.patient_rating || 0), 0) / completedRides.length
          : 0;

        const lastRide = userRides.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return {
          id: profile.id,
          name: profile.full_name,
          email: '', // Email não disponível por segurança
          phone: profile.phone || '',
          status: profile.is_active ? 'Ativo' : 'Inativo',
          totalRides: userRides.length,
          rating: avgRating,
          joinDate: profile.created_at,
          lastActivity: lastRide?.created_at || profile.created_at,
          address: profile.patients?.[0]?.address || '',
          susNumber: profile.patients?.[0]?.sus_number || ''
        };
      }) || [];

      setPatients(formattedPatients);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatientStatus = async (patientId: string, newStatus: string) => {
    try {
      const isActive = newStatus === 'Ativo';
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', patientId);

      if (error) throw error;

      // Atualizar também o status de aprovação
      await supabase
        .from('user_approvals')
        .upsert({
          user_id: patientId,
          user_type: 'patient',
          status: isActive ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString()
        });

      await fetchPatients();
      toast.success(`Status do paciente alterado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do paciente');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    isLoading,
    updatePatientStatus,
    refetchPatients: fetchPatients
  };
};
