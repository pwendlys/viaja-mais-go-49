
-- ATENÇÃO: Este script irá APAGAR COMPLETAMENTE todo o banco de dados
-- Esta ação é IRREVERSÍVEL - todos os dados serão perdidos permanentemente

-- 1. Remover todas as triggers primeiro para evitar erros de dependência
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_pricing_config_updated_at ON public.pricing_config;
DROP TRIGGER IF EXISTS update_user_approvals_updated_at ON public.user_approvals;
DROP TRIGGER IF EXISTS update_ride_history_updated_at ON public.ride_history;
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
DROP TRIGGER IF EXISTS audit_drivers_trigger ON public.drivers;
DROP TRIGGER IF EXISTS audit_patients_trigger ON public.patients;
DROP TRIGGER IF EXISTS audit_rides_trigger ON public.rides;

-- 2. Remover todas as funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance(numeric, numeric, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS update_ride_history_updated_at() CASCADE;

-- 3. Remover todas as views materializadas
DROP MATERIALIZED VIEW IF EXISTS public.mv_ride_statistics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.mv_driver_performance CASCADE;

-- 4. Remover todas as tabelas (em ordem para respeitar foreign keys)
DROP TABLE IF EXISTS public.ride_metrics CASCADE;
DROP TABLE IF EXISTS public.realtime_notifications CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.driver_payments CASCADE;
DROP TABLE IF EXISTS public.user_approvals CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.ride_history CASCADE;
DROP TABLE IF EXISTS public.ride_categories CASCADE;
DROP TABLE IF EXISTS public.pricing_config CASCADE;
DROP TABLE IF EXISTS public.health_facilities CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 5. Remover todos os tipos customizados
DROP TYPE IF EXISTS public.ride_status CASCADE;
DROP TYPE IF EXISTS public.driver_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- 6. Remover tabelas antigas se existirem
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.motoristas CASCADE;
DROP TABLE IF EXISTS public.corridas CASCADE;
DROP TABLE IF EXISTS public.taxas CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;

-- 7. Criar estrutura básica apenas para administrador
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type = 'admin'),
  admin_role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Habilitar RLS apenas para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Política para permitir que administradores vejam seus próprios dados
CREATE POLICY "Admins can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 10. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Inserir perfil do administrador (será criado quando o usuário fizer login)
-- O usuário admin@adm.com deve ser criado manualmente no Supabase Auth
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  user_type,
  admin_role,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Administrador Sistema',
  'admin@adm.com',
  'admin',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type,
  admin_role = EXCLUDED.admin_role,
  is_active = EXCLUDED.is_active;
