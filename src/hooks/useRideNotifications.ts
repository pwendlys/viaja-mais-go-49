
import { useEffect, useState } from 'react';
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

interface PendingRequest {
  id: string;
  patientName: string;
  patientId: string;
  originAddress: string;
  destinationAddress: string;
  price?: number;
  estimatedDistance?: number;
  createdAt: string;
}

export const useRideNotifications = (userId?: string | null, isDriver: boolean = false) => {
  const channels = isDriver ? ['ride_requests'] : [];
  const { notifications, isConnected, sendNotification } = useRealtimeNotifications(userId || undefined, channels);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Buscar solicitações pendentes se for motorista
    if (isDriver) {
      fetchPendingRequests();
    }

    // Escutar mudanças nas corridas do usuário
    const ridesChannel = supabase
      .channel('rides_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: isDriver ? `driver_id=eq.${userId}` : `patient_id=eq.${userId}`
      }, (payload) => {
        console.log('Ride change detected:', payload);
        handleRideChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ridesChannel);
    };
  }, [userId, isDriver]);

  const fetchPendingRequests = async () => {
    if (!userId || !isDriver) return;

    try {
      const { data: rides, error } = await supabase
        .from('rides')
        .select(`
          id,
          origin_address,
          destination_address,
          price,
          distance_km,
          created_at,
          patient_id,
          profiles!rides_patient_id_fkey(full_name)
        `)
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = rides?.map(ride => ({
        id: ride.id,
        patientName: ride.profiles?.full_name || 'Paciente',
        patientId: ride.patient_id,
        originAddress: ride.origin_address,
        destinationAddress: ride.destination_address,
        price: ride.price,
        estimatedDistance: ride.distance_km,
        createdAt: ride.created_at
      })) || [];

      setPendingRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleRideChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'UPDATE' && newRecord.status !== oldRecord.status) {
      const statusMessages = {
        'assigned': isDriver ? 'Você aceitou a corrida!' : 'Motorista aceito! Ele está a caminho.',
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

    // Atualizar lista de solicitações pendentes
    if (isDriver && eventType === 'INSERT' && newRecord.status === 'requested') {
      fetchPendingRequests();
    }
  };

  const acceptRide = async (rideId: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ 
          status: 'assigned',
          driver_id: userId 
        })
        .eq('id', rideId);

      if (error) throw error;

      toast.success('Corrida aceita com sucesso!');
      
      // Remover da lista de pendentes
      setPendingRequests(prev => prev.filter(req => req.id !== rideId));
      
      return true;
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Erro ao aceitar corrida');
      return false;
    }
  };

  const rejectRide = async (rideId: string) => {
    try {
      // Por enquanto, apenas remove da lista local
      // Em uma implementação completa, poderia marcar como rejeitado
      setPendingRequests(prev => prev.filter(req => req.id !== rideId));
      toast.info('Corrida rejeitada');
      return true;
    } catch (error) {
      console.error('Error rejecting ride:', error);
      toast.error('Erro ao rejeitar corrida');
      return false;
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
    pendingRequests,
    acceptRide,
    rejectRide,
    notifyRideRequest,
    notifyRideAccepted,
    notifyDriverArriving,
    notifyRideStarted,
    notifyRideCompleted
  };
};
