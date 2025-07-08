
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

    const { distance_km, duration_minutes, vehicle_type = 'conforto' } = await req.json()

    if (!distance_km || !duration_minutes) {
      throw new Error('Distance and duration are required')
    }

    // Get pricing configuration
    const { data: pricingConfig, error: pricingError } = await supabaseClient
      .from('pricing_config')
      .select('*')
      .eq('vehicle_type', vehicle_type)
      .eq('is_active', true)
      .single()

    if (pricingError || !pricingConfig) {
      // Use default pricing if no config found
      const defaultPricing = {
        price_per_km: 2.50,
        base_fare: 5.00,
        per_minute_rate: 0.30
      }
      
      const calculatedPrice = defaultPricing.base_fare + 
                            (defaultPricing.price_per_km * distance_km) + 
                            (defaultPricing.per_minute_rate * duration_minutes)

      return new Response(JSON.stringify({
        price: parseFloat(calculatedPrice.toFixed(2)),
        pricing_config: defaultPricing,
        calculation: {
          base_fare: defaultPricing.base_fare,
          distance_cost: defaultPricing.price_per_km * distance_km,
          time_cost: defaultPricing.per_minute_rate * duration_minutes,
          total: calculatedPrice
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate price based on configuration
    const calculatedPrice = pricingConfig.base_fare + 
                          (pricingConfig.price_per_km * distance_km) + 
                          (pricingConfig.per_minute_rate * duration_minutes)

    return new Response(JSON.stringify({
      price: parseFloat(calculatedPrice.toFixed(2)),
      pricing_config: pricingConfig,
      calculation: {
        base_fare: pricingConfig.base_fare,
        distance_cost: pricingConfig.price_per_km * distance_km,
        time_cost: pricingConfig.per_minute_rate * duration_minutes,
        total: calculatedPrice
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error calculating ride price:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
