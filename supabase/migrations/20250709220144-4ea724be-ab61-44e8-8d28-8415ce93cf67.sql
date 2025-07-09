
-- Adicionar campo vehicle_type à tabela drivers
ALTER TABLE public.drivers 
ADD COLUMN vehicle_type TEXT DEFAULT 'economico';

-- Adicionar campo preferred_vehicle_type à tabela patients para suas preferências
ALTER TABLE public.patients 
ADD COLUMN preferred_vehicle_type TEXT DEFAULT 'economico';

-- Atualizar a tabela pricing_config para ter apenas dois tipos de veículo
DELETE FROM public.pricing_config WHERE vehicle_type NOT IN ('economico', 'conforto');

-- Garantir que temos configurações para os dois tipos
INSERT INTO public.pricing_config (vehicle_type, price_per_km, base_fare, per_minute_rate, is_active) 
VALUES 
  ('economico', 2.00, 4.00, 0.25, true),
  ('conforto', 2.80, 6.00, 0.35, true)
ON CONFLICT DO NOTHING;

-- Atualizar motoristas existentes com tipo de veículo baseado no modelo
UPDATE public.drivers 
SET vehicle_type = CASE 
  WHEN LOWER(vehicle_model) LIKE '%civic%' OR LOWER(vehicle_model) LIKE '%corolla%' OR LOWER(vehicle_model) LIKE '%fit%' 
    THEN 'economico'
  ELSE 'conforto'
END
WHERE vehicle_type = 'economico';
