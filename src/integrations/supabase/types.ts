export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          driver_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference_rides: string[] | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          driver_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_rides?: string[] | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          driver_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_rides?: string[] | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "mv_driver_performance"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          current_lat: number | null
          current_lng: number | null
          id: string
          is_available: boolean | null
          license_expiry: string
          license_number: string
          rating: number | null
          total_rides: number | null
          vehicle_color: string | null
          vehicle_model: string
          vehicle_plate: string
          vehicle_type: string | null
          vehicle_year: number | null
        }
        Insert: {
          current_lat?: number | null
          current_lng?: number | null
          id: string
          is_available?: boolean | null
          license_expiry: string
          license_number: string
          rating?: number | null
          total_rides?: number | null
          vehicle_color?: string | null
          vehicle_model: string
          vehicle_plate: string
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Update: {
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_available?: boolean | null
          license_expiry?: string
          license_number?: string
          rating?: number | null
          total_rides?: number | null
          vehicle_color?: string | null
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drivers_profiles"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_facilities: {
        Row: {
          address: string
          created_at: string | null
          facility_type: string
          id: string
          is_active: boolean | null
          lat: number
          lng: number
          name: string
          phone: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          facility_type: string
          id?: string
          is_active?: boolean | null
          lat: number
          lng: number
          name: string
          phone?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean | null
          lat?: number
          lng?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          ride_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          ride_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          ride_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_ride"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notifications_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string
          city: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_condition: string | null
          mobility_needs: string | null
          neighborhood: string | null
          preferred_vehicle_type: string | null
          state: string | null
          sus_number: string | null
        }
        Insert: {
          address: string
          city?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          medical_condition?: string | null
          mobility_needs?: string | null
          neighborhood?: string | null
          preferred_vehicle_type?: string | null
          state?: string | null
          sus_number?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_condition?: string | null
          mobility_needs?: string | null
          neighborhood?: string | null
          preferred_vehicle_type?: string | null
          state?: string | null
          sus_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patients_profiles"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          base_fare: number
          created_at: string
          id: string
          is_active: boolean
          per_minute_rate: number
          price_per_km: number
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          base_fare?: number
          created_at?: string
          id?: string
          is_active?: boolean
          per_minute_rate?: number
          price_per_km?: number
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          base_fare?: number
          created_at?: string
          id?: string
          is_active?: boolean
          per_minute_rate?: number
          price_per_km?: number
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_role: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      realtime_notifications: {
        Row: {
          channel_name: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          message: Json
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          channel_name: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          message: Json
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          channel_name?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          message?: Json
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          priority_level: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority_level?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority_level?: number
        }
        Relationships: []
      }
      ride_metrics: {
        Row: {
          id: string
          metric_data: Json | null
          metric_type: string
          metric_value: number | null
          recorded_at: string | null
          ride_id: string | null
        }
        Insert: {
          id?: string
          metric_data?: Json | null
          metric_type: string
          metric_value?: number | null
          recorded_at?: string | null
          ride_id?: string | null
        }
        Update: {
          id?: string
          metric_data?: Json | null
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string | null
          ride_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_metrics_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          appointment_date: string | null
          appointment_type: string | null
          category_id: string | null
          completed_at: string | null
          created_at: string | null
          destination_address: string
          destination_lat: number
          destination_lng: number
          distance_km: number | null
          driver_id: string | null
          driver_rating: number | null
          duration_minutes: number | null
          facility_id: string | null
          id: string
          medical_notes: string | null
          notes: string | null
          origin_address: string
          origin_lat: number
          origin_lng: number
          patient_id: string
          patient_rating: number | null
          price: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_type?: string | null
          category_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination_address: string
          destination_lat: number
          destination_lng: number
          distance_km?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          duration_minutes?: number | null
          facility_id?: string | null
          id?: string
          medical_notes?: string | null
          notes?: string | null
          origin_address: string
          origin_lat: number
          origin_lng: number
          patient_id: string
          patient_rating?: number | null
          price?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_type?: string | null
          category_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination_address?: string
          destination_lat?: number
          destination_lng?: number
          distance_km?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          duration_minutes?: number | null
          facility_id?: string | null
          id?: string
          medical_notes?: string | null
          notes?: string | null
          origin_address?: string
          origin_lat?: number
          origin_lng?: number
          patient_id?: string
          patient_rating?: number | null
          price?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rides_driver"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rides_driver"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "mv_driver_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rides_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "health_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rides_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ride_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "mv_driver_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "health_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_approvals: {
        Row: {
          created_at: string
          documents_uploaded: boolean | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          documents_uploaded?: boolean | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          documents_uploaded?: boolean | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_approvals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_driver_performance: {
        Row: {
          avg_distance: number | null
          avg_rating: number | null
          full_name: string | null
          id: string | null
          total_earnings: number | null
          total_rides: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drivers_profiles"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_ride_statistics: {
        Row: {
          avg_distance: number | null
          avg_duration: number | null
          avg_price: number | null
          date: string | null
          status: string | null
          total_rides: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
