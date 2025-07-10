
-- FASE 1: CORREÇÃO CRÍTICA DO BANCO DE DADOS

-- 1.1 Adicionar constraints de integridade referencial faltantes
ALTER TABLE public.drivers 
ADD CONSTRAINT fk_drivers_profiles 
FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.patients 
ADD CONSTRAINT fk_patients_profiles 
FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.rides 
ADD CONSTRAINT fk_rides_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.rides 
ADD CONSTRAINT fk_rides_driver 
FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;

ALTER TABLE public.rides 
ADD CONSTRAINT fk_rides_facility 
FOREIGN KEY (facility_id) REFERENCES public.health_facilities(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT fk_notifications_ride 
FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE SET NULL;

-- 1.2 Adicionar constraints de domínio e validação
ALTER TABLE public.drivers 
ADD CONSTRAINT chk_driver_rating CHECK (rating >= 0 AND rating <= 5);

ALTER TABLE public.rides 
ADD CONSTRAINT chk_patient_rating CHECK (patient_rating >= 1 AND patient_rating <= 5),
ADD CONSTRAINT chk_driver_rating CHECK (driver_rating >= 1 AND driver_rating <= 5),
ADD CONSTRAINT chk_price_positive CHECK (price > 0),
ADD CONSTRAINT chk_distance_positive CHECK (distance_km > 0),
ADD CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0);

ALTER TABLE public.profiles 
ADD CONSTRAINT chk_user_type CHECK (user_type IN ('patient', 'driver', 'admin'));

ALTER TABLE public.drivers 
ADD CONSTRAINT chk_vehicle_type CHECK (vehicle_type IN ('economico', 'conforto', 'premium', 'acessivel'));

ALTER TABLE public.patients 
ADD CONSTRAINT chk_preferred_vehicle_type CHECK (preferred_vehicle_type IN ('economico', 'conforto', 'premium', 'acessivel'));

-- 1.3 Criar índices para otimização de performance
-- Índices espaciais para consultas geográficas
CREATE INDEX IF NOT EXISTS idx_drivers_location_available 
ON public.drivers USING btree (current_lat, current_lng) 
WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_rides_origin_location 
ON public.rides USING btree (origin_lat, origin_lng);

CREATE INDEX IF NOT EXISTS idx_rides_destination_location 
ON public.rides USING btree (destination_lat, destination_lng);

-- Índices compostos para relatórios e queries frequentes
CREATE INDEX IF NOT EXISTS idx_rides_patient_status_date 
ON public.rides (patient_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rides_driver_status_date 
ON public.rides (driver_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_date 
ON public.notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rides_status_created 
ON public.rides (status, created_at DESC);

-- Índices para busca de texto
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_gin 
ON public.profiles USING gin(to_tsvector('portuguese', full_name));

CREATE INDEX IF NOT EXISTS idx_health_facilities_name_gin 
ON public.health_facilities USING gin(to_tsvector('portuguese', name));

-- 1.4 Tabelas de auditoria e logs
CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table_record ON public.audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_user_date ON public.audit_log (user_id, created_at DESC);
CREATE INDEX idx_audit_log_action_date ON public.audit_log (action, created_at DESC);

-- Tabela de notificações em tempo real
CREATE TABLE public.realtime_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  message JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_realtime_notifications_status ON public.realtime_notifications (status, scheduled_for);
CREATE INDEX idx_realtime_notifications_user ON public.realtime_notifications (user_id, created_at DESC);

-- 1.5 Sistema de métricas e analytics
CREATE TABLE public.ride_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ride_metrics_ride ON public.ride_metrics (ride_id);
CREATE INDEX idx_ride_metrics_type_date ON public.ride_metrics (metric_type, recorded_at DESC);

-- 1.6 Funções para cálculos otimizados
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL(10,8), 
  lng1 DECIMAL(11,8), 
  lat2 DECIMAL(10,8), 
  lng2 DECIMAL(11,8)
) RETURNS DECIMAL(8,2) AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- Earth's radius in km
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlng := RADIANS(lng2 - lng1);
  a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1.7 Triggers de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoria nas tabelas críticas
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_drivers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_rides_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 1.8 Views materializadas para relatórios
CREATE MATERIALIZED VIEW public.mv_ride_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  status,
  COUNT(*) as total_rides,
  AVG(price) as avg_price,
  AVG(distance_km) as avg_distance,
  AVG(duration_minutes) as avg_duration
FROM public.rides 
GROUP BY DATE_TRUNC('day', created_at), status;

CREATE UNIQUE INDEX idx_mv_ride_statistics ON public.mv_ride_statistics (date, status);

CREATE MATERIALIZED VIEW public.mv_driver_performance AS
SELECT 
  d.id,
  p.full_name,
  COUNT(r.id) as total_rides,
  AVG(r.driver_rating) as avg_rating,
  SUM(r.price) as total_earnings,
  AVG(r.distance_km) as avg_distance
FROM public.drivers d
JOIN public.profiles p ON d.id = p.id
LEFT JOIN public.rides r ON d.id = r.driver_id AND r.status = 'completed'
GROUP BY d.id, p.full_name;

CREATE UNIQUE INDEX idx_mv_driver_performance ON public.mv_driver_performance (id);

-- 1.9 Habilitar Row Level Security nas novas tabelas
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_log (apenas admins podem ver)
CREATE POLICY "Admins can view audit log"
  ON public.audit_log
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND admin_role = 'admin'
  ));

-- Políticas RLS para realtime_notifications
CREATE POLICY "Users can view own notifications"
  ON public.realtime_notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Políticas RLS para ride_metrics
CREATE POLICY "Users can view metrics for their rides"
  ON public.ride_metrics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.rides r 
    WHERE r.id = ride_id 
    AND (r.patient_id = auth.uid() OR r.driver_id = auth.uid())
  ));

-- 1.10 Configurar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Habilitar REPLICA IDENTITY FULL para capturar mudanças completas
ALTER TABLE public.realtime_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.rides REPLICA IDENTITY FULL;
