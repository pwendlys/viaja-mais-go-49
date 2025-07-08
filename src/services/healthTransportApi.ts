
import { supabase } from '@/integrations/supabase/client'

export class HealthTransportApiService {
  // Mapbox services
  async calculateRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const { data, error } = await supabase.functions.invoke('mapbox-health-transport', {
      body: {
        action: 'calculate_route',
        origin,
        destination
      }
    })

    if (error) throw error
    return data
  }

  async geocodeAddress(query: string) {
    const { data, error } = await supabase.functions.invoke('mapbox-health-transport', {
      body: {
        action: 'geocode',
        query
      }
    })

    if (error) throw error
    return data
  }

  async reverseGeocode(lat: number, lng: number) {
    const { data, error } = await supabase.functions.invoke('mapbox-health-transport', {
      body: {
        action: 'reverse_geocode',
        lat,
        lng
      }
    })

    if (error) throw error
    return data
  }

  // Ride management
  async requestRide(rideData: {
    patient_id: string
    origin_address: string
    origin_lat: number
    origin_lng: number
    destination_address: string
    destination_lat: number
    destination_lng: number
    facility_id?: string
    appointment_date?: string
    distance_km: number
    duration_minutes: number
    price: number
  }) {
    const { data, error } = await supabase.functions.invoke('ride-management', {
      body: {
        action: 'request_ride',
        ...rideData
      }
    })

    if (error) throw error
    return data
  }

  async acceptRide(ride_id: string, driver_id: string) {
    const { data, error } = await supabase.functions.invoke('ride-management', {
      body: {
        action: 'accept_ride',
        ride_id,
        driver_id
      }
    })

    if (error) throw error
    return data
  }

  async updateRideStatus(ride_id: string, status: string, user_id: string) {
    const { data, error } = await supabase.functions.invoke('ride-management', {
      body: {
        action: 'update_ride_status',
        ride_id,
        status,
        user_id
      }
    })

    if (error) throw error
    return data
  }

  async getUserRides(user_id: string, user_type: 'patient' | 'driver') {
    const { data, error } = await supabase.functions.invoke('ride-management', {
      body: {
        action: 'get_user_rides',
        user_id,
        user_type
      }
    })

    if (error) throw error
    return data
  }

  // User management
  async completeProfile(user_id: string, user_type: string, profile_data: any, specific_data: any) {
    const { data, error } = await supabase.functions.invoke('user-management', {
      body: {
        action: 'complete_profile',
        user_id,
        user_type,
        profile_data,
        specific_data
      }
    })

    if (error) throw error
    return data
  }

  async getUserProfile(user_id: string) {
    const { data, error } = await supabase.functions.invoke('user-management', {
      body: {
        action: 'get_user_profile',
        user_id
      }
    })

    if (error) throw error
    return data
  }

  async updateDriverLocation(driver_id: string, lat: number, lng: number) {
    const { data, error } = await supabase.functions.invoke('user-management', {
      body: {
        action: 'update_driver_location',
        driver_id,
        lat,
        lng
      }
    })

    if (error) throw error
    return data
  }

  async toggleDriverAvailability(driver_id: string, is_available: boolean) {
    const { data, error } = await supabase.functions.invoke('user-management', {
      body: {
        action: 'toggle_driver_availability',
        driver_id,
        is_available
      }
    })

    if (error) throw error
    return data
  }

  async getHealthFacilities() {
    const { data, error } = await supabase.functions.invoke('user-management', {
      body: {
        action: 'get_health_facilities'
      }
    })

    if (error) throw error
    return data
  }

  // Admin functions
  async getDashboardStats() {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'get_dashboard_stats'
      }
    })

    if (error) throw error
    return data
  }

  async getRidesReport(start_date: string, end_date: string) {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'get_rides_report',
        start_date,
        end_date
      }
    })

    if (error) throw error
    return data
  }
}

export const healthTransportApi = new HealthTransportApiService()
