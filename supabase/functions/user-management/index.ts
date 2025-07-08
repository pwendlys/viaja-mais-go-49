
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
      case 'complete_profile': {
        const { user_id, user_type, profile_data, specific_data } = params

        // Create or update profile
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .upsert({
            id: user_id,
            user_type,
            ...profile_data
          })
          .select()
          .single()

        if (profileError) throw profileError

        // Create specific user type data
        if (user_type === 'patient') {
          const { error: patientError } = await supabaseClient
            .from('patients')
            .upsert({
              id: user_id,
              ...specific_data
            })

          if (patientError) throw patientError
        } else if (user_type === 'driver') {
          const { error: driverError } = await supabaseClient
            .from('drivers')
            .upsert({
              id: user_id,
              ...specific_data
            })

          if (driverError) throw driverError
        }

        return new Response(JSON.stringify({ success: true, profile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_user_profile': {
        const { user_id } = params

        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user_id)
          .single()

        if (profileError) throw profileError

        let specificData = null
        if (profile.user_type === 'patient') {
          const { data } = await supabaseClient
            .from('patients')
            .select('*')
            .eq('id', user_id)
            .single()
          specificData = data
        } else if (profile.user_type === 'driver') {
          const { data } = await supabaseClient
            .from('drivers')
            .select('*')
            .eq('id', user_id)
            .single()
          specificData = data
        }

        return new Response(JSON.stringify({ 
          profile,
          specific_data: specificData 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_driver_location': {
        const { driver_id, lat, lng } = params

        const { error } = await supabaseClient
          .from('drivers')
          .update({
            current_lat: lat,
            current_lng: lng,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver_id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'toggle_driver_availability': {
        const { driver_id, is_available } = params

        const { error } = await supabaseClient
          .from('drivers')
          .update({
            is_available,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver_id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_health_facilities': {
        const { data: facilities, error } = await supabaseClient
          .from('health_facilities')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error

        return new Response(JSON.stringify({ facilities }), {
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
