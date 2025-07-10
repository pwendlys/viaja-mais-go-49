
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface RideData {
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  patientId: string;
  driverId?: string;
  vehicleType?: string;
  scheduledTime?: Date;
}

export const useRideValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateRideRequest = useCallback(async (rideData: RideData): Promise<ValidationResult> => {
    setIsValidating(true);
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Validar coordenadas
      if (!isValidCoordinate(rideData.origin.lat, rideData.origin.lng)) {
        errors.push('Coordenadas de origem inválidas');
      }

      if (!isValidCoordinate(rideData.destination.lat, rideData.destination.lng)) {
        errors.push('Coordenadas de destino inválidas');
      }

      // 2. Calcular distância
      const { data: distance } = await supabase.rpc('calculate_distance', {
        lat1: rideData.origin.lat,
        lng1: rideData.origin.lng,
        lat2: rideData.destination.lat,
        lng2: rideData.destination.lng
      });

      if (distance === 0) {
        errors.push('Origem e destino são o mesmo local');
      }

      if (distance > 100) { // Máximo 100km
        errors.push('Distância muito longa (máximo 100km)');
      }

      if (distance > 50) {
        warnings.push('Corrida longa (mais de 50km) - confirme se é necessária');
      }

      // 3. Validar disponibilidade do paciente
      const { data: existingRides } = await supabase
        .from('rides')
        .select('id, status')
        .eq('patient_id', rideData.patientId)
        .in('status', ['requested', 'accepted', 'in_progress']);

      if (existingRides && existingRides.length > 0) {
        errors.push('Paciente já possui uma corrida ativa');
      }

      // 4. Validar horário agendado
      if (rideData.scheduledTime) {
        const now = new Date();
        const scheduledTime = new Date(rideData.scheduledTime);
        
        if (scheduledTime < now) {
          errors.push('Não é possível agendar para horário passado');
        }

        if (scheduledTime.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1000) {
          warnings.push('Agendamento com mais de 7 dias de antecedência');
        }
      }

      // 5. Validar motorista se especificado
      if (rideData.driverId) {
        const { data: driver } = await supabase
          .from('drivers')
          .select('is_available, current_lat, current_lng')
          .eq('id', rideData.driverId)
          .single();

        if (!driver) {
          errors.push('Motorista não encontrado');
        } else if (!driver.is_available) {
          errors.push('Motorista não está disponível');
        } else if (!driver.current_lat || !driver.current_lng) {
          warnings.push('Localização do motorista não disponível');
        }
      }

      // 6. Validar endereços
      if (!rideData.origin.address || rideData.origin.address.length < 10) {
        warnings.push('Endereço de origem muito curto - verifique se está completo');
      }

      if (!rideData.destination.address || rideData.destination.address.length < 10) {
        warnings.push('Endereço de destino muito curto - verifique se está completo');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Erro na validação:', error);
      return {
        isValid: false,
        errors: ['Erro interno na validação'],
        warnings: []
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateDriverStatus = useCallback(async (driverId: string): Promise<ValidationResult> => {
    setIsValidating(true);
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { data: driver } = await supabase
        .from('drivers')
        .select(`
          *,
          profiles!drivers_id_fkey (is_active, user_type)
        `)
        .eq('id', driverId)
        .single();

      if (!driver) {
        errors.push('Motorista não encontrado');
        return { isValid: false, errors, warnings };
      }

      // Verificar se o perfil está ativo
      if (!(driver.profiles as any)?.is_active) {
        errors.push('Perfil do motorista está inativo');
      }

      // Verificar documentos
      if (!driver.license_number || driver.license_number.length < 5) {
        errors.push('Número da CNH inválido');
      }

      if (!driver.license_expiry) {
        errors.push('Data de validade da CNH não informada');
      } else {
        const expiryDate = new Date(driver.license_expiry);
        const now = new Date();
        
        if (expiryDate < now) {
          errors.push('CNH vencida');
        } else if (expiryDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
          warnings.push('CNH vence em menos de 30 dias');
        }
      }

      // Verificar veículo
      if (!driver.vehicle_model || !driver.vehicle_plate) {
        errors.push('Dados do veículo incompletos');
      }

      // Verificar localização se disponível
      if (driver.is_available && (!driver.current_lat || !driver.current_lng)) {
        warnings.push('Motorista disponível mas sem localização');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Erro na validação do motorista:', error);
      return {
        isValid: false,
        errors: ['Erro interno na validação do motorista'],
        warnings: []
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateRideUpdate = useCallback(async (rideId: string, newStatus: string): Promise<ValidationResult> => {
    setIsValidating(true);
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { data: ride } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (!ride) {
        errors.push('Corrida não encontrada');
        return { isValid: false, errors, warnings };
      }

      const validTransitions: Record<string, string[]> = {
        'requested': ['accepted', 'cancelled'],
        'accepted': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
      };

      if (!validTransitions[ride.status]?.includes(newStatus)) {
        errors.push(`Transição inválida de ${ride.status} para ${newStatus}`);
      }

      // Validações específicas por status
      if (newStatus === 'completed') {
        if (!ride.driver_id) {
          errors.push('Corrida não pode ser completada sem motorista');
        }
        
        const timeDiff = new Date().getTime() - new Date(ride.created_at).getTime();
        if (timeDiff < 2 * 60 * 1000) { // Menos de 2 minutos
          warnings.push('Corrida completada muito rapidamente');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Erro na validação da atualização:', error);
      return {
        isValid: false,
        errors: ['Erro interno na validação da atualização'],
        warnings: []
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
  };

  return {
    validateRideRequest,
    validateDriverStatus,
    validateRideUpdate,
    isValidating
  };
};
