
-- Criar tabela para controlar pagamentos aos motoristas
CREATE TABLE public.driver_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES public.drivers(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL DEFAULT 'manual',
  reference_rides UUID[] DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para auditoria de ações administrativas
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controlar status de aprovação de usuários
CREATE TABLE public.user_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  user_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  documents_uploaded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo admin_role na tabela profiles para identificar administradores
ALTER TABLE public.profiles ADD COLUMN admin_role TEXT DEFAULT NULL;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.driver_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para driver_payments (apenas admins podem ver)
CREATE POLICY "Admins can manage driver payments"
  ON public.driver_payments
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND admin_role = 'admin'
  ));

-- Políticas RLS para admin_audit_log (apenas admins podem ver)
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND admin_role = 'admin'
  ));

CREATE POLICY "System can insert audit log"
  ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Políticas RLS para user_approvals (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage user approvals"
  ON public.user_approvals
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND admin_role = 'admin'
  ));

-- Criar índices para performance
CREATE INDEX idx_driver_payments_driver_id ON public.driver_payments(driver_id);
CREATE INDEX idx_driver_payments_payment_date ON public.driver_payments(payment_date);
CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX idx_user_approvals_user_id ON public.user_approvals(user_id);
CREATE INDEX idx_user_approvals_status ON public.user_approvals(status);

-- Atualizar função de trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger para user_approvals
CREATE TRIGGER update_user_approvals_updated_at 
    BEFORE UPDATE ON public.user_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados iniciais para pricing_config se não existirem
INSERT INTO public.pricing_config (vehicle_type, price_per_km, base_fare, per_minute_rate, is_active)
VALUES 
  ('economico', 2.00, 4.00, 0.25, true),
  ('conforto', 2.50, 5.00, 0.30, true),
  ('premium', 3.50, 7.00, 0.40, true)
ON CONFLICT DO NOTHING;

-- Inserir categorias de corrida se não existirem
INSERT INTO public.ride_categories (name, description, priority_level, is_active)
VALUES 
  ('Consulta Regular', 'Consulta médica de rotina', 1, true),
  ('Exame', 'Realização de exames médicos', 2, true),
  ('Emergência', 'Transporte de emergência', 5, true),
  ('Fisioterapia', 'Sessões de fisioterapia', 1, true),
  ('Quimioterapia', 'Tratamento oncológico', 4, true)
ON CONFLICT DO NOTHING;
