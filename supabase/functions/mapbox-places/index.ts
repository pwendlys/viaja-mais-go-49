
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, proximity, bbox, limit = 5 } = await req.json()
    const apiKey = Deno.env.get('MAPBOX_API_KEY')

    if (!apiKey) {
      throw new Error('Mapbox API key not configured')
    }

    if (!query) {
      throw new Error('Query text is required')
    }

    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${apiKey}&country=BR&language=pt&limit=${limit}&types=poi,address,place`

    if (proximity) {
      url += `&proximity=${proximity.lng},${proximity.lat}`
    }

    if (bbox) {
      url += `&bbox=${bbox.join(',')}`
    }

    const response = await fetch(url)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in mapbox-places function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
