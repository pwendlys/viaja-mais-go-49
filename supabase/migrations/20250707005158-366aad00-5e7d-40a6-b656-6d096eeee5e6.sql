
-- Criar enum para status das corridas
CREATE TYPE ride_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado');

-- Criar enum para status dos motoristas
CREATE TYPE driver_status AS ENUM ('ativo', 'inativo');

-- Tabela de Usuários
CREATE TABLE public.usuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Motoristas
CREATE TABLE public.motoristas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    telefone TEXT,
    documentos JSONB,
    status driver_status NOT NULL DEFAULT 'ativo',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Corridas
CREATE TABLE public.corridas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    id_usuario UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_motorista UUID REFERENCES public.motoristas(id) ON DELETE SET NULL,
    origem_latitude DECIMAL(10, 8) NOT NULL,
    origem_longitude DECIMAL(11, 8) NOT NULL,
    destino_latitude DECIMAL(10, 8) NOT NULL,
    destino_longitude DECIMAL(11, 8) NOT NULL,
    origem_endereco TEXT,
    destino_endereco TEXT,
    distancia DECIMAL(10, 2),
    tempo_estimado DECIMAL(10, 2),
    valor DECIMAL(10, 2),
    status ride_status NOT NULL DEFAULT 'pendente',
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Taxas
CREATE TABLE public.taxas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    taxa_base DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    preco_por_km DECIMAL(10, 2) NOT NULL DEFAULT 2.50,
    preco_por_minuto DECIMAL(10, 2) NOT NULL DEFAULT 0.50,
    taxa_dinamica DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir taxas padrão
INSERT INTO public.taxas (taxa_base, preco_por_km, preco_por_minuto, taxa_dinamica) 
VALUES (5.00, 2.50, 0.50, 1.0);

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Usuários
CREATE POLICY "Usuários podem ver seus próprios dados" 
    ON public.usuarios 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
    ON public.usuarios 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Políticas RLS para Motoristas
CREATE POLICY "Motoristas podem ver seus próprios dados" 
    ON public.motoristas 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Motoristas podem atualizar seus próprios dados" 
    ON public.motoristas 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Políticas RLS para Corridas
CREATE POLICY "Usuários podem ver suas próprias corridas" 
    ON public.corridas 
    FOR SELECT 
    USING (auth.uid() = id_usuario);

CREATE POLICY "Motoristas podem ver corridas atribuídas a eles" 
    ON public.corridas 
    FOR SELECT 
    USING (auth.uid() = id_motorista);

CREATE POLICY "Usuários podem criar corridas" 
    ON public.corridas 
    FOR INSERT 
    WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuários e motoristas podem atualizar corridas relacionadas" 
    ON public.corridas 
    FOR UPDATE 
    USING (auth.uid() = id_usuario OR auth.uid() = id_motorista);

-- Políticas RLS para Taxas (somente leitura para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver taxas" 
    ON public.taxas 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar data_atualizacao nas corridas
CREATE TRIGGER update_corridas_updated_at 
    BEFORE UPDATE ON public.corridas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar data_atualizacao nas taxas
CREATE TRIGGER update_taxas_updated_at 
    BEFORE UPDATE ON public.taxas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhorar performance
CREATE INDEX idx_corridas_usuario ON public.corridas(id_usuario);
CREATE INDEX idx_corridas_motorista ON public.corridas(id_motorista);
CREATE INDEX idx_corridas_status ON public.corridas(status);
CREATE INDEX idx_motoristas_location ON public.motoristas(latitude, longitude);
CREATE INDEX idx_motoristas_status ON public.motoristas(status);
