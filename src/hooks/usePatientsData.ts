
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
          created_at,
          patients (
            address,
            sus_number,
            medical_condition,
            mobility_needs,
            emergency_contact_name,
            emergency_contact_phone
          )
        `)
        .eq('user_type', 'patient');

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles encontrados:', profilesData?.length || 0);

      // Buscar aprovações de usuários
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('user_approvals')
        .select('user_id, status')
        .eq('user_type', 'patient');

      if (approvalsError) {
        console.error('Erro ao buscar aprovações:', approvalsError);
      }

      // Criar mapa de aprovações
      const approvalsMap = (approvalsData || []).reduce((acc, approval) => {
        acc[approval.user_id] = approval.status;
        return acc;
      }, {} as Record<string, string>);

      const formattedPatients = (profilesData || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Nome não informado',
        email: '', // Email não está disponível via profiles por segurança
        phone: profile.phone || '',
        address: (profile.patients as any)?.[0]?.address || 'Não informado',
        susNumber: (profile.patients as any)?.[0]?.sus_number || 'Não informado',
        medicalCondition: (profile.patients as any)?.[0]?.medical_condition || 'Não informado',
        mobilityNeeds: (profile.patients as any)?.[0]?.mobility_needs || 'Não informado',
        status: profile.is_active ? 'Ativo' : 'Inativo',
        joinDate: profile.created_at || '',
        documentsStatus: approvalsMap[profile.id] === 'approved' ? 'Aprovado' : 
                        approvalsMap[profile.id] === 'rejected' ? 'Rejeitado' : 'Pendente',
        emergencyContactName: (profile.patients as any)?.[0]?.emergency_contact_name || '',
        emergencyContactPhone: (profile.patients as any)?.[0]?.emergency_contact_phone || ''
      }));

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

      // Atualizar também o status de aprovação se necessário
      if (newStatus === 'Ativo') {
        await supabase
          .from('user_approvals')
          .upsert({
            user_id: patientId,
            user_type: 'patient',
            status: 'approved',
            reviewed_at: new Date().toISOString()
          });
      }

      await fetchPatients();
      toast.success(`Status do paciente alterado para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do paciente');
    }
  };

  const approveDocuments = async (patientId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('user_approvals')
        .upsert({
          user_id: patientId,
          user_type: 'patient',
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: approved ? null : rejectionReason
        });

      if (error) throw error;

      // Se aprovado, ativar o paciente
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
