
-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'driver')),
  profile_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id)
);

-- Criar tabela específica para pacientes
CREATE TABLE public.patients (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sus_card TEXT NOT NULL,
  has_dependency BOOLEAN DEFAULT FALSE,
  dependency_description TEXT,
  PRIMARY KEY (id)
);

-- Criar tabela específica para motoristas
CREATE TABLE public.drivers (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cnh_number TEXT NOT NULL,
  cnh_front_photo TEXT,
  cnh_back_photo TEXT,
  vehicle_document TEXT,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_color TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  PRIMARY KEY (id)
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas para patients
CREATE POLICY "Patients can view their own data" 
  ON public.patients 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Patients can update their own data" 
  ON public.patients 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Patients can insert their own data" 
  ON public.patients 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas para drivers
CREATE POLICY "Drivers can view their own data" 
  ON public.drivers 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own data" 
  ON public.drivers 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Drivers can insert their own data" 
  ON public.drivers 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Criar bucket de storage para fotos e documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('user-uploads', 'user-uploads', true);

-- Política para o bucket de uploads
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
