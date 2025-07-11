
-- Adicionar tipos de usuário
CREATE TYPE user_role AS ENUM ('admin', 'patient', 'driver');

-- Atualizar tabela profiles para suportar todos os tipos de usuários
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_user_type_check;

ALTER TABLE public.profiles 
ALTER COLUMN user_type TYPE user_role USING user_type::user_role;

-- Adicionar coluna de senha para admin (temporária, apenas para desenvolvimento)
ALTER TABLE public.profiles 
ADD COLUMN temp_password TEXT;

-- Recriar as tabelas necessárias
CREATE TABLE public.patients (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Juiz de Fora',
  state TEXT DEFAULT 'MG',
  neighborhood TEXT,
  sus_number TEXT,
  medical_condition TEXT,
  mobility_needs TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_vehicle_type TEXT DEFAULT 'economico'
);

CREATE TABLE public.drivers (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  license_number TEXT NOT NULL,
  license_expiry DATE NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'economico',
  vehicle_color TEXT,
  vehicle_year INTEGER,
  is_available BOOLEAN DEFAULT false,
  current_lat NUMERIC,
  current_lng NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0
);

-- Habilitar RLS para novas tabelas
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Políticas para patients
CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update own data" ON public.patients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients can insert own data" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para drivers
CREATE POLICY "Drivers can view own data" ON public.drivers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Drivers can update own data" ON public.drivers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Drivers can insert own data" ON public.drivers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Atualizar políticas da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile on signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert profile on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Atualizar o perfil do admin
UPDATE public.profiles 
SET user_type = 'admin'::user_role, temp_password = 'adm@2025'
WHERE email = 'adm@adm.com';

-- Criar usuário admin no auth.users se não existir
-- Nota: Isso será tratado no código da aplicação
