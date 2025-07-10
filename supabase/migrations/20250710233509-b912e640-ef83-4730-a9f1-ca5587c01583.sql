
-- Criar tabela para histórico de agendamentos
CREATE TABLE public.ride_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_info JSONB, -- Informações do veículo na época da viagem
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_departure TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  transport_type TEXT DEFAULT 'tradicional' CHECK (transport_type IN ('tradicional', 'acessivel')),
  fare_amount DECIMAL(10,2),
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  notes TEXT,
  cancellation_reason TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.ride_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own ride history" 
  ON public.ride_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ride history" 
  ON public.ride_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ride history" 
  ON public.ride_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ride_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ride_history_updated_at
  BEFORE UPDATE ON public.ride_history
  FOR EACH ROW
  EXECUTE FUNCTION update_ride_history_updated_at();

-- Índices para performance
CREATE INDEX idx_ride_history_user_id ON public.ride_history(user_id);
CREATE INDEX idx_ride_history_status ON public.ride_history(status);
CREATE INDEX idx_ride_history_scheduled_date ON public.ride_history(scheduled_date);
CREATE INDEX idx_ride_history_created_at ON public.ride_history(created_at);

-- Inserir alguns dados de exemplo
INSERT INTO public.ride_history (
  user_id, 
  origin_address, 
  destination_address, 
  scheduled_date, 
  status, 
  transport_type, 
  fare_amount, 
  distance_km, 
  duration_minutes,
  notes
) VALUES 
(
  auth.uid(), 
  'Rua das Flores, 123 - Centro, Juiz de Fora', 
  'Hospital Municipal - Centro, Juiz de Fora', 
  NOW() - INTERVAL '7 days', 
  'completed', 
  'tradicional', 
  0.00, 
  3.2, 
  15,
  'Consulta cardiológica'
),
(
  auth.uid(), 
  'Rua das Flores, 123 - Centro, Juiz de Fora', 
  'Policlínica Central - Centro, Juiz de Fora', 
  NOW() - INTERVAL '3 days', 
  'completed', 
  'tradicional', 
  0.00, 
  2.8, 
  12,
  'Exame de sangue'
),
(
  auth.uid(), 
  'Rua das Flores, 123 - Centro, Juiz de Fora', 
  'UPA Norte - Bairro Industrial, Juiz de Fora', 
  NOW() + INTERVAL '2 days', 
  'scheduled', 
  'acessivel', 
  0.00, 
  4.5, 
  20,
  'Fisioterapia'
);
