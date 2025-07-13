-- Limpeza completa do banco de dados Supabase
-- Remove todos os triggers primeiro
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_rides_updated_at ON public.rides;
DROP TRIGGER IF EXISTS update_pricing_config_updated_at ON public.pricing_config;
DROP TRIGGER IF EXISTS update_user_approvals_updated_at ON public.user_approvals;

-- Remove todas as materialized views
DROP MATERIALIZED VIEW IF EXISTS public.mv_driver_performance CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.mv_ride_statistics CASCADE;

-- Remove todas as funções personalizadas
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance(numeric, numeric, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.audit_trigger_function() CASCADE;

-- Remove todas as tabelas em ordem de dependência
DROP TABLE IF EXISTS public.ride_metrics CASCADE;
DROP TABLE IF EXISTS public.realtime_notifications CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.driver_payments CASCADE;
DROP TABLE IF EXISTS public.user_approvals CASCADE;
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.health_facilities CASCADE;
DROP TABLE IF EXISTS public.ride_categories CASCADE;
DROP TABLE IF EXISTS public.pricing_config CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remove todos os tipos personalizados
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.ride_status CASCADE;
DROP TYPE IF EXISTS public.driver_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Remove todas as publicações realtime se existirem
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.drivers;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.patients;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.rides;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.driver_payments;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.user_approvals;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.health_facilities;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.pricing_config;