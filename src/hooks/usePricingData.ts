
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingConfig {
  id: string;
  vehicle_type: string;
  price_per_km: number;
  base_fare: number;
  per_minute_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePricingData = () => {
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPricingConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .in('vehicle_type', ['economico', 'conforto'])
        .order('vehicle_type', { ascending: true });

      if (error) throw error;

      setPricingConfigs(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações de preço:', error);
      toast.error('Erro ao carregar configurações de preço');
    } finally {
      setIsLoading(false);
    }
  };

  const addPricingConfig = async (config: Omit<PricingConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Verificar se já existe configuração para este tipo de veículo
      const { data: existing } = await supabase
        .from('pricing_config')
        .select('id')
        .eq('vehicle_type', config.vehicle_type)
        .single();

      if (existing) {
        toast.error('Já existe configuração para este tipo de veículo');
        return null;
      }

      const { data, error } = await supabase
        .from('pricing_config')
        .insert(config)
        .select()
        .single();

      if (error) throw error;

      await fetchPricingConfigs();
      toast.success('Configuração de preço adicionada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
      toast.error('Erro ao adicionar configuração de preço');
      return null;
    }
  };

  const updatePricingConfig = async (id: string, updates: Partial<PricingConfig>) => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchPricingConfigs();
      toast.success('Configuração atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  const toggleConfigStatus = async (id: string) => {
    try {
      const config = pricingConfigs.find(c => c.id === id);
      if (!config) return;

      await updatePricingConfig(id, { is_active: !config.is_active });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da configuração');
    }
  };

  useEffect(() => {
    fetchPricingConfigs();
  }, []);

  return {
    pricingConfigs,
    isLoading,
    addPricingConfig,
    updatePricingConfig,
    toggleConfigStatus,
    refetchPricingConfigs: fetchPricingConfigs
  };
};
