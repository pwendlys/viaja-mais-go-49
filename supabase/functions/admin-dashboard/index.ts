
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
      case 'get_dashboard_stats': {
        // Get total counts
        const { count: totalPatients } = await supabaseClient
          .from('patients')
          .select('*', { count: 'exact', head: true })

        const { count: totalDrivers } = await supabaseClient
          .from('drivers')
          .select('*', { count: 'exact', head: true })

        const { count: totalRides } = await supabaseClient
          .from('rides')
          .select('*', { count: 'exact', head: true })

        const { count: activeRides } = await supabaseClient
          .from('rides')
          .select('*', { count: 'exact', head: true })
          .in('status', ['requested', 'accepted', 'driver_arriving', 'in_progress'])

        const { count: availableDrivers } = await supabaseClient
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true)

        // Get recent rides
        const { data: recentRides } = await supabaseClient
          .from('rides')
          .select(`
            *,
            profiles!rides_patient_id_fkey (full_name),
            profiles!rides_driver_id_fkey (full_name),
            health_facilities (name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        return new Response(JSON.stringify({
          stats: {
            total_patients: totalPatients || 0,
            total_drivers: totalDrivers || 0,
            total_rides: totalRides || 0,
            active_rides: activeRides || 0,
            available_drivers: availableDrivers || 0
          },
          recent_rides: recentRides || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_rides_report': {
        const { start_date, end_date } = params

        const { data: rides, error } = await supabaseClient
          .from('rides')
          .select(`
            *,
            profiles!rides_patient_id_fkey (full_name, phone),
            profiles!rides_driver_id_fkey (full_name, phone),
            health_facilities (name, address)
          `)
          .gte('created_at', start_date)
          .lte('created_at', end_date)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(JSON.stringify({ rides }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'manage_user': {
        const { user_id, action_type } = params

        if (action_type === 'activate') {
          const { error } = await supabaseClient
            .from('profiles')
            .update({ is_active: true })
            .eq('id', user_id)

          if (error) throw error
        } else if (action_type === 'deactivate') {
          const { error } = await supabaseClient
            .from('profiles')
            .update({ is_active: false })
            .eq('id', user_id)

          if (error) throw error
        }

        return new Response(JSON.stringify({ success: true }), {
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
