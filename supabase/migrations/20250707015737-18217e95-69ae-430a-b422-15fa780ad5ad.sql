
-- Remover todas as triggers primeiro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_driver_rating_trigger ON public.ratings;

-- Remover todas as funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_driver_rating() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Remover todas as tabelas
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.pricing_config CASCADE;

-- Remover todos os tipos customizados
DROP TYPE IF EXISTS ride_status CASCADE;
DROP TYPE IF EXISTS driver_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
