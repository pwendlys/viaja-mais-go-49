
import { supabase } from '@/integrations/supabase/client'

export interface GeocodeResult {
  address_components: any[]
  formatted_address: string
  geometry: {
    location: { lat: number; lng: number }
    location_type: string
    viewport: any
  }
  place_id: string
  types: string[]
}

export interface DirectionsResult {
  routes: any[]
  summary: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
    start_address: string
    end_address: string
    polyline: string
  }
}

export interface PlaceAutocomplete {
  predictions: Array<{
    description: string
    place_id: string
    structured_formatting: {
      main_text: string
      secondary_text: string
    }
  }>
}

export interface DistanceMatrixResult {
  rows: Array<{
    elements: Array<{
      distance: { text: string; value: number }
      duration: { text: string; value: number }
      status: string
    }>
  }>
}

class GoogleMapsService {
  private async callFunction(functionName: string, payload: any) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    })

    if (error) {
      throw new Error(`Google Maps API error: ${error.message}`)
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    const data = await this.callFunction('google-maps-geocoding', { address })
    return data.results || []
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult[]> {
    const data = await this.callFunction('google-maps-geocoding', { lat, lng })
    return data.results || []
  }

  async getDirections(origin: string, destination: string, travelMode: string = 'driving'): Promise<DirectionsResult> {
    const data = await this.callFunction('google-maps-directions', {
      origin,
      destination,
      travelMode
    })
    return data
  }

  async searchPlaces(input: string, location?: string): Promise<PlaceAutocomplete> {
    const data = await this.callFunction('google-maps-places', {
      input,
      location
    })
    return data
  }

  async calculateDistanceMatrix(
    origins: string | string[],
    destinations: string | string[],
    travelMode: string = 'driving'
  ): Promise<DistanceMatrixResult> {
    const data = await this.callFunction('google-maps-distance-matrix', {
      origins,
      destinations,
      travelMode
    })
    return data
  }

  calculateFare(distanceKm: number, durationMinutes: number): number {
    // Base fare calculation - can be customized
    const baseFare = 5.00
    const perKmRate = 2.50
    const perMinuteRate = 0.30
    
    return baseFare + (distanceKm * perKmRate) + (durationMinutes * perMinuteRate)
  }
}

export const googleMapsService = new GoogleMapsService()
