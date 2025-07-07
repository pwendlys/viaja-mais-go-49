
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useMapboxApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const geocodeAddress = async (address: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-geocoding', {
        body: { address }
      })
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar endereço')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-geocoding', {
        body: { lat, lng }
      })
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar localização')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const calculateRoute = async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, profile = 'driving') => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-directions', {
        body: { origin, destination, profile }
      })
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular rota')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const searchPlaces = async (query: string, proximity?: { lat: number; lng: number }) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-places', {
        body: { query, proximity }
      })
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar lugares')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    geocodeAddress,
    reverseGeocode,
    calculateRoute,
    searchPlaces
  }
}
