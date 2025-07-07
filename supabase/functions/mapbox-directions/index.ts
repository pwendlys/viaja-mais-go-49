
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { origin, destination, profile = 'driving' } = await req.json()
    const apiKey = Deno.env.get('MAPBOX_API_KEY')

    if (!apiKey) {
      throw new Error('Mapbox API key not configured')
    }

    if (!origin || !destination) {
      throw new Error('Origin and destination are required')
    }

    // Support both coordinate arrays and objects
    const originCoords = Array.isArray(origin) ? origin : [origin.lng, origin.lat]
    const destCoords = Array.isArray(destination) ? destination : [destination.lng, destination.lat]

    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${apiKey}&language=pt&overview=full&steps=true`

    const response = await fetch(url)
    const data = await response.json()

    // Extract useful information
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      
      const result = {
        ...data,
        summary: {
          distance: {
            text: `${(route.distance / 1000).toFixed(1)} km`,
            value: route.distance
          },
          duration: {
            text: `${Math.round(route.duration / 60)} min`,
            value: route.duration
          },
          geometry: route.geometry
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in mapbox-directions function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
