
import { useEffect } from 'react';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RideNotificationData {
  rideId: string;
  driverId?: string;
  patientId?: string;
  origin?: { lat: number; lng: number; address: string };
  destination?: { lat: number; lng: number; address: string };
  estimatedTime?: number;
  fare?: number;
}

export const useRideNotifications = (userId?: string, userType?: 'patient' | 'driver') => {
  const channels = userType === 'driver' ? ['ride_requests'] : [];
  const { notifications, isConnected, sendNotification } = useRealtimeNotifications(userId, channels);

  useEffect(() => {
    if (!userId) return;

    // Escutar mudanças nas corridas do usuário
    const ridesChannel = supabase
      .channel('rides_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: userType === 'driver' ? `driver_id=eq.${userId}` : `patient_id=eq.${userId}`
      }, (payload) => {
        console.log('Ride change detected:', payload);
        handleRideChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ridesChannel);
    };
  }, [userId, userType]);

  const handleRideChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'UPDATE' && newRecord.status !== oldRecord.status) {
      const statusMessages = {
        'assigned': userType === 'patient' ? 'Motorista aceito! Ele está a caminho.' : 'Você aceitou a corrida!',
        'in-progress': 'Corrida iniciada!',
        'completed': 'Corrida concluída com sucesso!',
        'cancelled': 'Corrida cancelada.'
      };

      const message = statusMessages[newRecord.status];
      if (message) {
        toast(message, {
          description: `Corrida #${newRecord.id.slice(0, 8)}`,
          duration: 5000,
        });
      }
    }
  };

  // Funções específicas para diferentes tipos de notificação
  const notifyRideRequest = async (rideData: RideNotificationData) => {
    return sendNotification('ride_request', 
      `Nova corrida disponível: ${rideData.origin?.address} → ${rideData.destination?.address}`,
      rideData
    );
  };

  const notifyRideAccepted = async (rideData: RideNotificationData) => {
    return sendNotification('ride_accepted',
      'Sua corrida foi aceita! O motorista está a caminho.',
      rideData
    );
  };

  const notifyDriverArriving = async (rideData: RideNotificationData) => {
    return sendNotification('driver_arriving',
      `O motorista chegará em aproximadamente ${rideData.estimatedTime} minutos.`,
      rideData
    );
  };

  const notifyRideStarted = async (rideData: RideNotificationData) => {
    return sendNotification('ride_started',
      'Sua corrida foi iniciada! Boa viagem.',
      rideData
    );
  };

  const notifyRideCompleted = async (rideData: RideNotificationData) => {
    return sendNotification('ride_completed',
      `Corrida concluída! Valor: R$ ${rideData.fare?.toFixed(2)}`,
      rideData
    );
  };

  return {
    notifications,
    isConnected,
    notifyRideRequest,
    notifyRideAccepted,
    notifyDriverArriving,
    notifyRideStarted,
    notifyRideCompleted
  };
};
