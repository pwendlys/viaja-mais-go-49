
-- Drop all existing tables and functions
DROP TABLE IF EXISTS public.notes CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create new database structure for health transport app
-- Users profiles table (extending Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'driver', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients specific data
CREATE TABLE public.patients (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  sus_number TEXT UNIQUE,
  medical_condition TEXT,
  mobility_needs TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT NOT NULL,
  neighborhood TEXT,
  city TEXT DEFAULT 'Juiz de Fora',
  state TEXT DEFAULT 'MG'
);

-- Drivers specific data
CREATE TABLE public.drivers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  vehicle_plate TEXT UNIQUE NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  vehicle_color TEXT,
  is_available BOOLEAN DEFAULT false,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0
);

-- Health facilities (hospitals, clinics, etc.)
CREATE TABLE public.health_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('hospital', 'clinic', 'lab', 'pharmacy')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rides table
CREATE TABLE public.rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  driver_id UUID REFERENCES public.drivers(id),
  origin_address TEXT NOT NULL,
  origin_lat DECIMAL(10,8) NOT NULL,
  origin_lng DECIMAL(11,8) NOT NULL,
  destination_address TEXT NOT NULL,
  destination_lat DECIMAL(10,8) NOT NULL,
  destination_lng DECIMAL(11,8) NOT NULL,
  facility_id UUID REFERENCES public.health_facilities(id),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'driver_arriving', 'in_progress', 'completed', 'cancelled')),
  appointment_date TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  price DECIMAL(10,2),
  patient_rating INTEGER CHECK (patient_rating BETWEEN 1 AND 5),
  driver_rating INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  ride_id UUID REFERENCES public.rides(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ride_request', 'ride_accepted', 'driver_arriving', 'ride_completed', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profile on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update own data" ON public.patients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients can insert own data" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for drivers
CREATE POLICY "Drivers can view own data" ON public.drivers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Drivers can update own data" ON public.drivers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Drivers can insert own data" ON public.drivers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view available drivers" ON public.drivers
  FOR SELECT USING (is_available = true);

-- RLS Policies for health facilities
CREATE POLICY "Anyone can view active facilities" ON public.health_facilities
  FOR SELECT USING (is_active = true);

-- RLS Policies for rides
CREATE POLICY "Patients can view own rides" ON public.rides
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Drivers can view assigned rides" ON public.rides
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Patients can create rides" ON public.rides
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Drivers can update assigned rides" ON public.rides
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "Patients can update own rides" ON public.rides
  FOR UPDATE USING (patient_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Indexes for better performance
CREATE INDEX idx_drivers_location ON public.drivers (current_lat, current_lng) WHERE is_available = true;
CREATE INDEX idx_rides_status ON public.rides (status);
CREATE INDEX idx_rides_patient ON public.rides (patient_id);
CREATE INDEX idx_rides_driver ON public.rides (driver_id);
CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default health facilities for Juiz de Fora
INSERT INTO public.health_facilities (name, address, lat, lng, facility_type, phone) VALUES
('Hospital Monte Sinai', 'Av. Barão do Rio Branco, 3111 - Centro, Juiz de Fora - MG', -21.7587, -43.3506, 'hospital', '(32) 3215-5000'),
('Santa Casa de Misericórdia', 'Av. Barão do Rio Branco, 2590 - Centro, Juiz de Fora - MG', -21.7612, -43.3511, 'hospital', '(32) 3257-3000'),
('Hospital Universitário UFJF', 'R. Catulo Breviglieri, s/n - Santa Catarina, Juiz de Fora - MG', -21.7804, -43.3668, 'hospital', '(32) 4009-5000'),
('UPA Norte', 'R. Guararapes, 2533 - Francisco Bernardino, Juiz de Fora - MG', -21.7234, -43.3398, 'clinic', '(32) 3690-8400'),
('UPA Sul', 'R. Oswaldo Aranha, 550 - São Mateus, Juiz de Fora - MG', -21.8156, -43.3742, 'clinic', '(32) 3690-8500');
