
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...params } = await req.json()

    switch (action) {
      case 'request_ride': {
        const {
          patient_id,
          origin_address,
          origin_lat,
          origin_lng,
          destination_address,
          destination_lat,
          destination_lng,
          facility_id,
          appointment_date,
          distance_km,
          duration_minutes,
          price
        } = params

        // Create ride request
        const { data: ride, error: rideError } = await supabaseClient
          .from('rides')
          .insert({
            patient_id,
            origin_address,
            origin_lat,
            origin_lng,
            destination_address,
            destination_lat,
            destination_lng,
            facility_id,
            appointment_date,
            distance_km,
            duration_minutes,
            price,
            status: 'requested'
          })
          .select()
          .single()

        if (rideError) throw rideError

        // Find available drivers nearby (within 10km radius)
        const { data: nearbyDrivers, error: driversError } = await supabaseClient
          .from('drivers')
          .select('id, current_lat, current_lng')
          .eq('is_available', true)
          .not('current_lat', 'is', null)
          .not('current_lng', 'is', null)

        if (driversError) throw driversError

        // Calculate distance to each driver and filter by proximity
        const availableDrivers = nearbyDrivers?.filter(driver => {
          const distance = calculateDistance(
            origin_lat,
            origin_lng,
            driver.current_lat,
            driver.current_lng
          )
          return distance <= 10 // 10km radius
        }) || []

        // Notify nearby drivers
        for (const driver of availableDrivers) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: driver.id,
              ride_id: ride.id,
              title: 'Nova Solicitação de Corrida',
              message: `Corrida de ${origin_address} para ${destination_address}`,
              type: 'ride_request'
            })
        }

        return new Response(JSON.stringify({ 
          success: true, 
          ride,
          available_drivers: availableDrivers.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'accept_ride': {
        const { ride_id, driver_id } = params

        // Update ride with driver assignment
        const { data: ride, error: rideError } = await supabaseClient
          .from('rides')
          .update({
            driver_id,
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', ride_id)
          .eq('status', 'requested') // Only accept if still requested
          .select()
          .single()

        if (rideError) throw rideError

        // Update driver availability
        await supabaseClient
          .from('drivers')
          .update({ is_available: false })
          .eq('id', driver_id)

        // Notify patient
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: ride.patient_id,
            ride_id: ride.id,
            title: 'Corrida Aceita',
            message: 'Um motorista aceitou sua corrida e está a caminho',
            type: 'ride_accepted'
          })

        return new Response(JSON.stringify({ success: true, ride }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_ride_status': {
        const { ride_id, status, user_id } = params

        const { data: ride, error } = await supabaseClient
          .from('rides')
          .update({
            status,
            updated_at: new Date().toISOString(),
            ...(status === 'completed' && { completed_at: new Date().toISOString() })
          })
          .eq('id', ride_id)
          .or(`patient_id.eq.${user_id},driver_id.eq.${user_id}`)
          .select()
          .single()

        if (error) throw error

        // If ride completed, make driver available again
        if (status === 'completed' && ride.driver_id) {
          await supabaseClient
            .from('drivers')
            .update({ is_available: true })
            .eq('id', ride.driver_id)
        }

        return new Response(JSON.stringify({ success: true, ride }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_user_rides': {
        const { user_id, user_type } = params

        const column = user_type === 'driver' ? 'driver_id' : 'patient_id'
        
        const { data: rides, error } = await supabaseClient
          .from('rides')
          .select(`
            *,
            health_facilities (name, address),
            profiles!rides_patient_id_fkey (full_name, phone),
            profiles!rides_driver_id_fkey (full_name, phone)
          `)
          .eq(column, user_id)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(JSON.stringify({ rides }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
