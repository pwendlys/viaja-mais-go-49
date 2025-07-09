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

  async manageUser(user_id: string, action_type: 'activate' | 'deactivate') {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'manage_user',
        user_id,
        action_type
      }
    })

    if (error) throw error
    return data
  }

  async approveUser(user_id: string, approved: boolean, rejection_reason?: string, admin_id?: string) {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'approve_user',
        user_id,
        approved,
        rejection_reason,
        admin_id
      }
    })

    if (error) throw error
    return data
  }

  async getPendingApprovals() {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'get_pending_approvals'
      }
    })

    if (error) throw error
    return data
  }

  async createDriverPayment(driver_id: string, amount: number, notes?: string, reference_rides?: string[], admin_id?: string) {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'create_driver_payment',
        driver_id,
        amount,
        notes,
        reference_rides,
        admin_id
      }
    })

    if (error) throw error
    return data
  }

  async getDriverPayments(driver_id?: string) {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: {
        action: 'get_driver_payments',
        driver_id
      }
    })

    if (error) throw error
    return data
  }

  // New price calculation service
  async calculateRidePrice(distance_km: number, duration_minutes: number, vehicle_type: string = 'conforto') {
    const { data, error } = await supabase.functions.invoke('calculate-ride-price', {
      body: {
        distance_km,
        duration_minutes,
        vehicle_type
      }
    })

    if (error) throw error
    return data
  }

  // Enhanced ride request with automatic price calculation
  async requestRideWithPricing(rideData: {
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
    vehicle_type?: string
    category_id?: string
    medical_notes?: string
    appointment_type?: string
  }) {
    // First calculate the price
    const pricingResult = await this.calculateRidePrice(
      rideData.distance_km,
      rideData.duration_minutes,
      rideData.vehicle_type || 'conforto'
    )

    // Then create the ride with calculated price
    const { data, error } = await supabase.functions.invoke('ride-management', {
      body: {
        action: 'request_ride',
        ...rideData,
        price: pricingResult.price
      }
    })

    if (error) throw error
    return {
      ...data,
      pricing_details: pricingResult
    }
  }

  // Get pricing configurations (for admin panel)
  async getPricingConfigs() {
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Update pricing configuration
  async updatePricingConfig(id: string, updates: {
    price_per_km?: number
    base_fare?: number
    per_minute_rate?: number
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('pricing_config')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get ride categories
  async getRideCategories() {
    const { data, error } = await supabase
      .from('ride_categories')
      .select('*')
      .eq('is_active', true)
      .order('priority_level', { ascending: false })

    if (error) throw error
    return data
  }
}

export const healthTransportApi = new HealthTransportApiService()
