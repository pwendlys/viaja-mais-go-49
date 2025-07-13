

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  susNumber: string;
  medicalCondition: string;
  mobilityNeeds: string;
  status: string;
  joinDate: string;
  documentsStatus: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  rating: number;
  totalRides: number;
}

export const usePatientsData = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      console.log('Buscando pacientes...');
      
      // Buscar todos os profiles de pacientes
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          is_active,
          created_at
        `)
        .eq('user_type', 'patient');

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles encontrados:', profilesData?.length || 0);

      // Get patient details for each profile
      const patientIds = profilesData?.map(profile => profile.id) || [];
      let patientDetails: any[] = [];
      
      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .in('id', patientIds);

        if (patientsError) {
          console.error('Error fetching patient details:', patientsError);
        } else {
          patientDetails = patientsData || [];
        }
      }

      const formattedPatients = (profilesData || []).map(profile => {
        const patientDetail = patientDetails.find(p => p.id === profile.id);

        return {
          id: profile.id,
          name: profile.full_name || 'Nome não informado',
          email: '', // Email não está disponível via profiles por segurança
          phone: profile.phone || '',
          address: 'Não informado', // We don't have address in current schema
          susNumber: patientDetail?.sus_card || 'Não informado',
          medicalCondition: 'Não informado', // Not in current schema
          mobilityNeeds: 'Não informado', // Not in current schema
          status: profile.is_active ? 'Ativo' : 'Inativo',
          joinDate: profile.created_at || '',
          documentsStatus: 'Pendente', // Default status
          emergencyContactName: '',
          emergencyContactPhone: '',
          rating: 0, // Default value
          totalRides: 0 // Default value
        };
      });

      console.log('Pacientes formatados:', formattedPatients.length);
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

      await fetchPatients();
      toast.success(`Status do paciente alterado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do paciente');
    }
  };

  const approveDocuments = async (patientId: string, approved: boolean, rejectionReason?: string) => {
    try {
      // Since we don't have user_approvals table, we'll just activate the patient
      if (approved) {
        await supabase
          .from('profiles')
          .update({ is_active: true })
          .eq('id', patientId);
      }

      await fetchPatients();
      toast.success(`Documentos ${approved ? 'aprovados' : 'rejeitados'}`);
    } catch (error) {
      console.error('Erro ao aprovar documentos:', error);
      toast.error('Erro ao processar aprovação');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    isLoading,
    updatePatientStatus,
    approveDocuments,
    refetchPatients: fetchPatients
  };
};

