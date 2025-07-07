
import { useState, useCallback } from 'react'
import { googleMapsService, GeocodeResult, DirectionsResult, PlaceAutocomplete } from '@/services/googleMapsService'
import { toast } from 'sonner'

export const useGoogleMaps = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: any) => {
    const message = error.message || 'Erro na API do Google Maps'
    setError(message)
    toast.error(message)
    console.error('Google Maps API Error:', error)
  }, [])

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult[]> => {
    setLoading(true)
    setError(null)
    try {
      const results = await googleMapsService.geocodeAddress(address)
      return results
    } catch (error) {
      handleError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<GeocodeResult[]> => {
    setLoading(true)
    setError(null)
    try {
      const results = await googleMapsService.reverseGeocode(lat, lng)
      return results
    } catch (error) {
      handleError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const getDirections = useCallback(async (origin: string, destination: string): Promise<DirectionsResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await googleMapsService.getDirections(origin, destination)
      return result
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const searchPlaces = useCallback(async (input: string): Promise<PlaceAutocomplete['predictions']> => {
    if (!input.trim()) return []
    
    setLoading(true)
    setError(null)
    try {
      const result = await googleMapsService.searchPlaces(input)
      return result.predictions || []
    } catch (error) {
      handleError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const calculateFare = useCallback((distanceKm: number, durationMinutes: number): number => {
    return googleMapsService.calculateFare(distanceKm, durationMinutes)
  }, [])

  return {
    loading,
    error,
    geocodeAddress,
    reverseGeocode,
    getDirections,
    searchPlaces,
    calculateFare
  }
}
