
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  type: 'ride_request' | 'ride_accepted' | 'driver_arriving' | 'ride_started' | 'ride_completed'
  userId?: string
  rideId?: string
  driverId?: string
  patientId?: string
  message: string
  data?: any
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, userId, rideId, driverId, patientId, message, data } = await req.json() as NotificationRequest

    console.log('Processing notification:', { type, userId, rideId, message })

    // Determinar destinatários baseado no tipo de notificação
    let recipients: string[] = []
    let channelName = ''

    switch (type) {
      case 'ride_request':
        // Notificar motoristas próximos disponíveis
        if (data?.lat && data?.lng) {
          const { data: nearbyDrivers } = await supabaseClient
            .from('drivers')
            .select('id')
            .eq('is_available', true)
            .not('current_lat', 'is', null)
            .not('current_lng', 'is', null)
          
          recipients = nearbyDrivers?.map(d => d.id) || []
          channelName = 'ride_requests'
        }
        break

      case 'ride_accepted':
        recipients = patientId ? [patientId] : []
        channelName = `ride_${rideId}`
        break

      case 'driver_arriving':
      case 'ride_started':
      case 'ride_completed':
        recipients = [patientId, driverId].filter(Boolean) as string[]
        channelName = `ride_${rideId}`
        break

      default:
        if (userId) {
          recipients = [userId]
          channelName = `user_${userId}`
        }
    }

    console.log('Recipients:', recipients)

    // Criar notificações para cada destinatário
    const notifications = recipients.map(recipientId => ({
      user_id: recipientId,
      channel_name: channelName,
      message: {
        type,
        title: getNotificationTitle(type),
        body: message,
        data: {
          rideId,
          driverId,
          patientId,
          ...data
        }
      },
      status: 'pending' as const
    }))

    if (notifications.length > 0) {
      // Inserir notificações no banco
      const { error: insertError } = await supabaseClient
        .from('realtime_notifications')
        .insert(notifications)

      if (insertError) {
        console.error('Error inserting notifications:', insertError)
        throw insertError
      }

      // Enviar notificações via Realtime
      for (const notification of notifications) {
        await supabaseClient.channel(notification.channel_name).send({
          type: 'broadcast',
          event: 'notification',
          payload: notification.message
        })
      }

      // Processar notificações push (implementar se necessário)
      await processNotificationQueue(supabaseClient, notifications)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: notifications.length,
        recipients 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getNotificationTitle(type: string): string {
  const titles = {
    'ride_request': 'Nova Solicitação de Corrida',
    'ride_accepted': 'Corrida Aceita',
    'driver_arriving': 'Motorista a Caminho',
    'ride_started': 'Corrida Iniciada',
    'ride_completed': 'Corrida Concluída'
  }
  return titles[type] || 'Notificação'
}

async function processNotificationQueue(supabaseClient: any, notifications: any[]) {
  // Implementar lógica de fila de notificações push
  console.log('Processing notification queue for:', notifications.length, 'notifications')
  
  // Aqui seria implementado:
  // 1. Envio de push notifications
  // 2. Fallback para email/SMS
  // 3. Retry logic
  // 4. Dead letter queue
}
