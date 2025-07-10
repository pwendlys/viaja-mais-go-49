
export interface RideHistoryItem {
  id: string;
  user_id: string;
  driver_id?: string;
  vehicle_info?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    plate?: string;
    type?: 'tradicional' | 'acessivel';
  };
  origin_address: string;
  destination_address: string;
  scheduled_date: string;
  actual_departure?: string;
  actual_arrival?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  transport_type: 'tradicional' | 'acessivel';
  fare_amount?: number;
  distance_km?: number;
  duration_minutes?: number;
  driver_rating?: number;
  service_rating?: number;
  notes?: string;
  cancellation_reason?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RideHistoryFilters {
  search: string;
  status: string;
  transportType: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RideHistoryStats {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  averageRating?: number;
  totalDistance?: number;
}
