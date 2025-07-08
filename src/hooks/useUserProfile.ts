
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { healthTransportApi } from '@/services/healthTransportApi';

interface UserProfileData {
  profile: {
    id: string;
    full_name: string;
    phone?: string;
    user_type: string;
    created_at: string;
  };
  patientData?: {
    sus_number?: string;
    address: string;
    city?: string;
    neighborhood?: string;
  };
  stats: {
    totalTrips: number;
    rating: number | null;
    hasRating: boolean;
  };
}

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Usuário não encontrado');
        return;
      }

      console.log('Buscando dados do usuário:', user.id);

      // Buscar dados do perfil
      const profileData = await healthTransportApi.getUserProfile(user.id);
      console.log('Dados do perfil:', profileData);
      
      // Inicializar stats padrão
      let stats = {
        totalTrips: 0,
        rating: null as number | null,
        hasRating: false
      };

      // Tentar buscar rides do usuário para calcular estatísticas
      try {
        const ridesData = await healthTransportApi.getUserRides(user.id, 'patient');
        console.log('Rides do usuário:', ridesData);
        
        if (ridesData && ridesData.rides) {
          // Calcular estatísticas
          const completedRides = ridesData.rides.filter(ride => ride.status === 'completed') || [];
          const totalTrips = completedRides.length;
          
          // Calcular avaliação média apenas se houver avaliações
          const ridesWithRating = completedRides.filter(ride => ride.driver_rating && ride.driver_rating > 0);
          const hasRating = ridesWithRating.length > 0;
          const rating = hasRating 
            ? ridesWithRating.reduce((sum, ride) => sum + (ride.driver_rating || 0), 0) / ridesWithRating.length
            : null;

          stats = {
            totalTrips,
            rating: rating ? Number(rating.toFixed(1)) : null,
            hasRating
          };
        }
      } catch (ridesError) {
        console.error('Erro ao buscar rides do usuário (usando dados padrão):', ridesError);
        // Continuar com stats padrão se a busca de rides falhar
      }

      setUserProfile({
        profile: profileData.profile,
        patientData: profileData.specific_data,
        stats
      });

    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { userProfile, loading, error, refetch: fetchUserProfile };
};
