
-- Limpar todas as tabelas e tipos existentes
DROP TABLE IF EXISTS public.corridas CASCADE;
DROP TABLE IF EXISTS public.motoristas CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.taxas CASCADE;
DROP TYPE IF EXISTS ride_status CASCADE;
DROP TYPE IF EXISTS driver_status CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Criar tipos enumerados
CREATE TYPE ride_status AS ENUM ('pendente', 'aceita', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE driver_status AS ENUM ('disponivel', 'ocupado', 'offline');
CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'admin');

-- Tabela de perfis de usuário (conectada ao auth.users do Supabase)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'passenger',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de motoristas (extensão dos perfis)
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT UNIQUE NOT NULL,
    vehicle_info JSONB NOT NULL,
    documents JSONB NOT NULL,
    status driver_status NOT NULL DEFAULT 'offline',
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE
);

-- Tabela de corridas
CREATE TABLE public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    pickup_longitude DECIMAL(11, 8) NOT NULL,
    destination_latitude DECIMAL(10, 8) NOT NULL,
    destination_longitude DECIMAL(11, 8) NOT NULL,
    pickup_address TEXT,
    destination_address TEXT,
    distance_km DECIMAL(10, 2),
    duration_minutes DECIMAL(10, 2),
    estimated_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2),
    status ride_status NOT NULL DEFAULT 'pendente',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    passenger_rating INTEGER CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'pending'
);

-- Tabela de configurações de preços
CREATE TABLE public.pricing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_fare DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    price_per_km DECIMAL(10, 2) NOT NULL DEFAULT 2.50,
    price_per_minute DECIMAL(10, 2) NOT NULL DEFAULT 0.50,
    surge_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
    minimum_fare DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id)
);

-- Inserir configuração de preços padrão
INSERT INTO public.pricing_config (base_fare, price_per_km, price_per_minute, surge_multiplier, minimum_fare)
VALUES (5.00, 2.50, 0.50, 1.0, 10.00);

-- Tabela de avaliações
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rated_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'passenger')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular avaliação média do motorista
CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.drivers 
    SET rating = (
        SELECT COALESCE(AVG(rating), 5.0)
        FROM public.ratings 
        WHERE rated_id = NEW.rated_id
    )
    WHERE id = NEW.rated_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_rating_trigger
    AFTER INSERT OR UPDATE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.update_driver_rating();

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para drivers
CREATE POLICY "Anyone can view active drivers" ON public.drivers FOR SELECT USING (status != 'offline');
CREATE POLICY "Drivers can update own data" ON public.drivers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Drivers can insert own data" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para rides
CREATE POLICY "Users can view own rides as passenger" ON public.rides FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Drivers can view assigned rides" ON public.rides FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Users can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Users and drivers can update related rides" ON public.rides FOR UPDATE USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- Políticas RLS para pricing_config
CREATE POLICY "Everyone can view active pricing" ON public.pricing_config FOR SELECT USING (is_active = true);

-- Políticas RLS para ratings
CREATE POLICY "Users can view ratings for their rides" ON public.ratings FOR SELECT USING (
    auth.uid() = rater_id OR 
    auth.uid() = rated_id OR 
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid()))
);
CREATE POLICY "Users can create ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Índices para performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_location ON public.drivers(current_latitude, current_longitude);
CREATE INDEX idx_rides_passenger ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_requested_at ON public.rides(requested_at);
CREATE INDEX idx_ratings_rated_id ON public.ratings(rated_id);
