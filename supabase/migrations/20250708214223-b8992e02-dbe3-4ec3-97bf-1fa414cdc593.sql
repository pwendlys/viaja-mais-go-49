
-- Criar tabela para configuração de preços por km
CREATE TABLE public.pricing_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_per_km DECIMAL(10,2) NOT NULL DEFAULT 2.50,
  base_fare DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  per_minute_rate DECIMAL(10,2) NOT NULL DEFAULT 0.30,
  vehicle_type TEXT NOT NULL DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para categorias de transporte médico
CREATE TABLE public.ride_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  priority_level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos à tabela rides para categoria médica
ALTER TABLE public.rides 
ADD COLUMN category_id UUID REFERENCES public.ride_categories(id),
ADD COLUMN medical_notes TEXT,
ADD COLUMN appointment_type TEXT;

-- Inserir configuração padrão de preços
INSERT INTO public.pricing_config (vehicle_type, price_per_km, base_fare, per_minute_rate) 
VALUES 
  ('economico', 2.00, 4.00, 0.25),
  ('conforto', 2.50, 5.00, 0.30),
  ('premium', 3.50, 7.00, 0.40);

-- Inserir categorias de transporte médico
INSERT INTO public.ride_categories (name, description, priority_level) 
VALUES 
  ('Consulta Médica', 'Transporte para consultas médicas de rotina', 1),
  ('Exames', 'Transporte para realização de exames', 1),
  ('Emergência', 'Transporte para situações de emergência médica', 3),
  ('Fisioterapia', 'Transporte para sessões de fisioterapia', 1),
  ('Hemodiálise', 'Transporte para sessões de hemodiálise', 2),
  ('Quimioterapia', 'Transporte para sessões de quimioterapia', 2);

-- Configurar RLS para pricing_config (apenas admins podem modificar)
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing" 
  ON public.pricing_config 
  FOR SELECT 
  USING (is_active = true);

-- Configurar RLS para ride_categories
ALTER TABLE public.ride_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" 
  ON public.ride_categories 
  FOR SELECT 
  USING (is_active = true);

-- Trigger para atualizar updated_at em pricing_config
CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON public.pricing_config
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
