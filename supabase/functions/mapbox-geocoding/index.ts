
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address, lat, lng } = await req.json()
    const apiKey = Deno.env.get('MAPBOX_API_KEY')

    if (!apiKey) {
      throw new Error('Mapbox API key not configured')
    }

    let url = ''
    
    if (address) {
      // Geocoding: address to coordinates
      url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&country=BR&language=pt&limit=5`
    } else if (lat && lng) {
      // Reverse geocoding: coordinates to address
      url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}&language=pt`
    } else {
      throw new Error('Either address or coordinates (lat, lng) must be provided')
    }

    const response = await fetch(url)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in mapbox-geocoding function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
