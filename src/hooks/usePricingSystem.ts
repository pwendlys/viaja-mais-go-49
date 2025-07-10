
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  baseRate: number;
  perKmRate: number;
  perMinuteRate: number;
  isActive: boolean;
}

interface PricingRule {
  id: string;
  name: string;
  vehicleTypeId: string;
  multiplier: number;
  timeStart?: string;
  timeEnd?: string;
  dayOfWeek?: number[];
  isHoliday?: boolean;
  isActive: boolean;
}

interface PriceCalculation {
  basePrice: number;
  distancePrice: number;
  timePrice: number;
  multiplierApplied: number;
  discountApplied: number;
  finalPrice: number;
  appliedRules: string[];
}

export const usePricingSystem = () => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicleTypes();
    fetchPricingRules();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .eq('is_active', true)
        .order('vehicle_type');

      if (error) throw error;

      const formattedTypes = data?.map(item => ({
        id: item.id,
        name: item.vehicle_type,
        description: getVehicleDescription(item.vehicle_type),
        baseRate: item.base_fare,
        perKmRate: item.price_per_km,
        perMinuteRate: item.per_minute_rate,
        isActive: item.is_active
      })) || [];

      setVehicleTypes(formattedTypes);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      toast.error('Erro ao carregar tipos de veículos');
    }
  };

  const fetchPricingRules = async () => {
    try {
      // Por enquanto, criar regras padrão em memória
      // Em uma implementação completa, estas seriam armazenadas no banco
      const defaultRules: PricingRule[] = [
        {
          id: '1',
          name: 'Tarifa Noturna',
          vehicleTypeId: 'all',
          multiplier: 1.3,
          timeStart: '22:00',
          timeEnd: '06:00',
          isActive: true
        },
        {
          id: '2',
          name: 'Tarifa de Feriado',
          vehicleTypeId: 'all',
          multiplier: 1.5,
          isHoliday: true,
          isActive: true
        },
        {
          id: '3',
          name: 'Tarifa de Final de Semana',
          vehicleTypeId: 'all',
          multiplier: 1.2,
          dayOfWeek: [0, 6], // Domingo e Sábado
          isActive: true
        }
      ];

      setPricingRules(defaultRules);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleDescription = (type: string): string => {
    const descriptions = {
      'economico': 'Veículo básico para transporte padrão',
      'conforto': 'Veículo confortável com ar-condicionado',
      'premium': 'Veículo de luxo com amenities especiais',
      'acessivel': 'Veículo adaptado para pessoas com deficiência',
      'ambulancia': 'Transporte médico especializado'
    };
    return descriptions[type] || 'Tipo de veículo padrão';
  };

  const calculatePrice = (
    vehicleTypeId: string,
    distanceKm: number,
    durationMinutes: number,
    isElderly: boolean = false,
    hasDisability: boolean = false,
    appointmentTime?: Date
  ): PriceCalculation => {
    const vehicleType = vehicleTypes.find(v => v.id === vehicleTypeId);
    if (!vehicleType) {
      throw new Error('Tipo de veículo não encontrado');
    }

    // Cálculo base
    const basePrice = vehicleType.baseRate;
    const distancePrice = distanceKm * vehicleType.perKmRate;
    const timePrice = durationMinutes * vehicleType.perMinuteRate;
    let subtotal = basePrice + distancePrice + timePrice;

    // Aplicar multiplicadores por horário/data
    let multiplierApplied = 1;
    const appliedRules: string[] = [];
    const currentTime = appointmentTime || new Date();

    for (const rule of pricingRules) {
      if (!rule.isActive) continue;
      if (rule.vehicleTypeId !== 'all' && rule.vehicleTypeId !== vehicleTypeId) continue;

      let shouldApply = false;

      // Verificar horário
      if (rule.timeStart && rule.timeEnd) {
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        if (rule.timeStart > rule.timeEnd) {
          // Período noturno que cruza meia-noite
          shouldApply = currentTimeStr >= rule.timeStart || currentTimeStr <= rule.timeEnd;
        } else {
          shouldApply = currentTimeStr >= rule.timeStart && currentTimeStr <= rule.timeEnd;
        }
      }

      // Verificar dia da semana
      if (rule.dayOfWeek && rule.dayOfWeek.includes(currentTime.getDay())) {
        shouldApply = true;
      }

      // Verificar feriado (implementação simplificada)
      if (rule.isHoliday && isHoliday(currentTime)) {
        shouldApply = true;
      }

      if (shouldApply) {
        multiplierApplied = Math.max(multiplierApplied, rule.multiplier);
        appliedRules.push(rule.name);
      }
    }

    subtotal *= multiplierApplied;

    // Aplicar descontos
    let discountApplied = 0;
    if (isElderly) {
      discountApplied += 0.15; // 15% desconto para idosos
      appliedRules.push('Desconto Idoso (15%)');
    }
    if (hasDisability) {
      discountApplied += 0.20; // 20% desconto para PcD
      appliedRules.push('Desconto PcD (20%)');
    }

    const finalPrice = subtotal * (1 - discountApplied);

    return {
      basePrice,
      distancePrice,
      timePrice,
      multiplierApplied,
      discountApplied,
      finalPrice: Math.max(finalPrice, vehicleType.baseRate), // Preço mínimo = tarifa base
      appliedRules
    };
  };

  const isHoliday = (date: Date): boolean => {
    // Implementação simplificada - verificar apenas alguns feriados nacionais
    const holidays = [
      '01-01', // Ano Novo
      '04-21', // Tiradentes
      '09-07', // Independência
      '10-12', // Nossa Senhora Aparecida
      '11-02', // Finados
      '11-15', // Proclamação da República
      '12-25'  // Natal
    ];

    const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return holidays.includes(dateStr);
  };

  const createVehicleType = async (vehicleType: Omit<VehicleType, 'id' | 'isActive'>) => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .insert({
          vehicle_type: vehicleType.name,
          base_fare: vehicleType.baseRate,
          price_per_km: vehicleType.perKmRate,
          per_minute_rate: vehicleType.perMinuteRate,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Tipo de veículo criado com sucesso!');
      await fetchVehicleTypes();
      return data;
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      toast.error('Erro ao criar tipo de veículo');
      throw error;
    }
  };

  const updateVehicleType = async (id: string, updates: Partial<VehicleType>) => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .update({
          base_fare: updates.baseRate,
          price_per_km: updates.perKmRate,
          per_minute_rate: updates.perMinuteRate,
          is_active: updates.isActive
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Tipo de veículo atualizado com sucesso!');
      await fetchVehicleTypes();
    } catch (error) {
      console.error('Error updating vehicle type:', error);
      toast.error('Erro ao atualizar tipo de veículo');
      throw error;
    }
  };

  return {
    vehicleTypes,
    pricingRules,
    loading,
    calculatePrice,
    createVehicleType,
    updateVehicleType,
    refreshData: () => {
      fetchVehicleTypes();
      fetchPricingRules();
    }
  };
};
