
export interface User {
  id: string
  full_name: string
  phone?: string
  avatar_url?: string
  user_type: 'patient' | 'driver' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  sus_number?: string
  medical_condition?: string
  mobility_needs?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  address: string
  neighborhood?: string
  city?: string
  state?: string
}

export interface Driver {
  id: string
  license_number: string
  license_expiry: string
  vehicle_plate: string
  vehicle_model: string
  vehicle_year?: number
  vehicle_color?: string
  is_available: boolean
  current_lat?: number
  current_lng?: number
  rating: number
  total_rides: number
}

export interface HealthFacility {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  facility_type: 'hospital' | 'clinic' | 'lab' | 'pharmacy'
  phone?: string
  is_active: boolean
  created_at: string
}

export interface Ride {
  id: string
  patient_id: string
  driver_id?: string
  origin_address: string
  origin_lat: number
  origin_lng: number
  destination_address: string
  destination_lat: number
  destination_lng: number
  facility_id?: string
  status: 'requested' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'
  appointment_date?: string
  distance_km?: number
  duration_minutes?: number
  price?: number
  patient_rating?: number
  driver_rating?: number
  notes?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface Notification {
  id: string
  user_id: string
  ride_id?: string
  title: string
  message: string
  type: 'ride_request' | 'ride_accepted' | 'driver_arriving' | 'ride_completed' | 'system'
  is_read: boolean
  created_at: string
}

export interface MapboxGeocodeResponse {
  features: Array<{
    id: string
    type: string
    place_name: string
    properties: any
    geometry: {
      type: string
      coordinates: [number, number]
    }
  }>
}

export interface MapboxRouteResponse {
  routes: Array<{
    geometry: {
      type: string
      coordinates: Array<[number, number]>
    }
    distance: number
    duration: number
    weight_name: string
    weight: number
  }>
  waypoints: Array<{
    hint: string
    distance: number
    name: string
    location: [number, number]
  }>
  code: string
  uuid: string
}
