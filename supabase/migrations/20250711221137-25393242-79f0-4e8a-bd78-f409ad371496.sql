
-- Inserir usuário administrador na tabela profiles
INSERT INTO public.profiles (
  id,
  full_name,
  user_type,
  admin_role,
  is_active,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- ID fixo para admin
  'Administrador Sistema',
  'admin',
  'admin',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type,
  admin_role = EXCLUDED.admin_role,
  is_active = EXCLUDED.is_active;

-- Habilitar realtime para todas as tabelas relevantes
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_facilities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pricing_config;

-- Configurar REPLICA IDENTITY para garantir dados completos no realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.rides REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.driver_payments REPLICA IDENTITY FULL;
ALTER TABLE public.user_approvals REPLICA IDENTITY FULL;
ALTER TABLE public.health_facilities REPLICA IDENTITY FULL;
ALTER TABLE public.pricing_config REPLICA IDENTITY FULL;
