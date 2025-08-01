
export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    type: 'tradicional' | 'acessivel';
  };
  rating: number;
  totalRides: number;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Patient {
  id: string;
  sus_number?: string;
  address: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  medical_condition?: string;
  mobility_needs?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_vehicle_type?: 'tradicional' | 'acessivel';
}

export interface Ride {
  id: string;
  patientId: string;
  driverId?: string;
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  status: 'requested' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  requestedAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  fare?: number;
  distance?: number;
  duration?: number;
  notes?: string;
  medicalNotes?: string;
  appointmentType?: string;
  vehicleType?: 'tradicional' | 'acessivel';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'patient' | 'driver' | 'admin';
  isActive: boolean;
  createdAt: Date;
  patient?: Patient;
  driver?: Driver;
}

export interface FavoriteLocation {
  id: string;
  userId: string;
  name: string;
  type: 'hospital' | 'home' | 'work' | 'other';
  address: string;
  lat: number;
  lng: number;
  createdAt: Date;
}

export interface PricingConfig {
  id: string;
  vehicle_type: 'tradicional' | 'acessivel';
  price_per_km: number;
  base_fare: number;
  per_minute_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
