
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationMessage {
  type: string;
  title: string;
  body: string;
  data?: any;
}

interface RealtimeNotification {
  id: string;
  channel_name: string;
  message: NotificationMessage;
  status: string;
  created_at: string;
}

export const useRealtimeNotifications = (userId?: string, channels: string[] = []) => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    console.log('Setting up realtime notifications for user:', userId);
    console.log('Channels:', channels);

    const channelsToSubscribe = [
      `user_${userId}`,
      'ride_requests',
      ...channels
    ];

    const subscriptions = channelsToSubscribe.map(channelName => {
      const channel = supabase.channel(channelName);
      
      channel
        .on('broadcast', { event: 'notification' }, (payload) => {
          console.log('Received notification:', payload);
          const message = payload.payload as NotificationMessage;
          
          // Mostrar toast
          toast(message.title, {
            description: message.body,
            duration: 5000,
          });

          // Adicionar à lista de notificações
          const notification: RealtimeNotification = {
            id: Date.now().toString(),
            channel_name: channelName,
            message,
            status: 'delivered',
            created_at: new Date().toISOString()
          };

          setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Manter só 50 mais recentes
        })
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'realtime_notifications',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('New notification in DB:', payload);
          const newNotification = payload.new as RealtimeNotification;
          
          // Processar notificação do banco de dados
          toast(newNotification.message.title, {
            description: newNotification.message.body,
            duration: 5000,
          });
        })
        .subscribe((status) => {
          console.log(`Channel ${channelName} status:`, status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          }
        });

      return channel;
    });

    // Cleanup
    return () => {
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [userId, channels.join(',')]);

  const sendNotification = async (
    type: string,
    message: string,
    data?: any
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('realtime-notifications', {
        body: {
          type,
          userId,
          message,
          data
        }
      });

      if (error) throw error;
      console.log('Notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    isConnected,
    sendNotification
  };
};
