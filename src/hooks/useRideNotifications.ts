
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RideRequest {
  id: string;
  patientId: string;
  patientName: string;
  originAddress: string;
  destinationAddress: string;
  appointmentDate?: string;
  distance?: number;
  price?: number;
  medicalNotes?: string;
}

export const useRideNotifications = (driverId: string | null, isOnline: boolean) => {
  const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);

  useEffect(() => {
    if (!driverId || !isOnline) {
      setPendingRequests([]);
      return;
    }

    // Escutar notificações em tempo real
    const channel = supabase
      .channel('ride-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${driverId}`
        },
        async (payload) => {
          const notification = payload.new;
          
          if (notification.type === 'ride_request' && notification.ride_id) {
            // Buscar detalhes da corrida
            const { data: ride } = await supabase
              .from('rides')
              .select(`
                id,
                patient_id,
                origin_address,
                destination_address,
                appointment_date,
                distance_km,
                price,
                medical_notes,
                profiles!rides_patient_id_fkey (full_name)
              `)
              .eq('id', notification.ride_id)
              .eq('status', 'requested')
              .single();

            if (ride) {
              const rideRequest: RideRequest = {
                id: ride.id,
                patientId: ride.patient_id,
                patientName: (ride.profiles as any)?.full_name || 'Paciente',
                originAddress: ride.origin_address,
                destinationAddress: ride.destination_address,
                appointmentDate: ride.appointment_date,
                distance: ride.distance_km,
                price: ride.price,
                medicalNotes: ride.medical_notes
              };

              setPendingRequests(prev => [...prev, rideRequest]);
              
              // Mostrar notificação
              toast.info(`Nova solicitação de corrida de ${rideRequest.patientName}`, {
                description: `${rideRequest.originAddress} → ${rideRequest.destinationAddress}`,
                duration: 10000,
                action: {
                  label: 'Ver',
                  onClick: () => {
                    // Aqui você pode abrir um modal com os detalhes
                  }
                }
              });
            }
          }
        }
      )
      .subscribe();

    // Buscar solicitações pendentes existentes
    const fetchPendingRequests = async () => {
      const { data: notifications } = await supabase
        .from('notifications')
        .select(`
          ride_id,
          rides!inner (
            id,
            patient_id,
            origin_address,
            destination_address,
            appointment_date,
            distance_km,
            price,
            medical_notes,
            profiles!rides_patient_id_fkey (full_name)
          )
        `)
        .eq('user_id', driverId)
        .eq('type', 'ride_request')
        .eq('is_read', false)
        .eq('rides.status', 'requested');

      if (notifications) {
        const requests: RideRequest[] = notifications.map(notification => {
          const ride = notification.rides as any;
          return {
            id: ride.id,
            patientId: ride.patient_id,
            patientName: ride.profiles?.full_name || 'Paciente',
            originAddress: ride.origin_address,
            destinationAddress: ride.destination_address,
            appointmentDate: ride.appointment_date,
            distance: ride.distance_km,
            price: ride.price,
            medicalNotes: ride.medical_notes
          };
        });

        setPendingRequests(requests);
      }
    };

    fetchPendingRequests();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, isOnline]);

  const acceptRide = async (rideId: string) => {
    if (!driverId) return;

    try {
      await supabase.functions.invoke('ride-management', {
        body: {
          action: 'accept_ride',
          ride_id: rideId,
          driver_id: driverId
        }
      });

      // Remover da lista de pendentes
      setPendingRequests(prev => prev.filter(req => req.id !== rideId));
      
      toast.success('Corrida aceita! O passageiro foi notificado.');
    } catch (error) {
      console.error('Erro ao aceitar corrida:', error);
      toast.error('Erro ao aceitar corrida');
    }
  };

  const rejectRide = async (rideId: string) => {
    // Apenas remover da lista local - a corrida ficará disponível para outros motoristas
    setPendingRequests(prev => prev.filter(req => req.id !== rideId));
    toast.info('Corrida rejeitada');
  };

  return {
    pendingRequests,
    acceptRide,
    rejectRide
  };
};
