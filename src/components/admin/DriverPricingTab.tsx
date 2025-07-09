import React, { useState } from 'react';
import { DollarSign, Edit, Save, X, MapPin, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePricingData } from '@/hooks/usePricingData';

interface PricingConfig {
  id: string;
  vehicle_type: string;
  price_per_km: number;
  base_fare: number;
  per_minute_rate: number;
  is_active: boolean;
}

const DriverPricingTab = () => {
  const { pricingConfigs, isLoading, updatePricingConfig, toggleConfigStatus } = usePricingData();
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PricingConfig>>({});

  const getVehicleTypeLabel = (type: string) => {
    const labels = {
      'tradicional': 'Tradicional',
      'acessivel': 'Acessível'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleEdit = (config: PricingConfig) => {
    setEditingConfig(config.id);
    setEditValues({
      price_per_km: config.price_per_km,
      base_fare: config.base_fare,
      per_minute_rate: config.per_minute_rate
    });
  };

  const handleSave = async (configId: string) => {
    await updatePricingConfig(configId, editValues);
    setEditingConfig(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setEditValues({});
  };

  const calculateSamplePrice = (config: PricingConfig, distance = 5, duration = 15) => {
    return (config.base_fare + (config.price_per_km * distance) + (config.per_minute_rate * duration)).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando configurações de preços...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configuração de Preços por Tipo de Veículo</h3>
          <p className="text-gray-600">Gerencie os valores para veículos Tradicionais e Acessíveis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {pricingConfigs.map((config) => (
          <Card key={config.id} className={`hover:shadow-md transition-shadow ${!config.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>{getVehicleTypeLabel(config.vehicle_type)}</span>
                </CardTitle>
                <Badge variant={config.is_active ? "default" : "secondary"}>
                  {config.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingConfig === config.id ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Preço por KM (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.10"
                      value={editValues.price_per_km || ''}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        price_per_km: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Taxa Base (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.10"
                      value={editValues.base_fare || ''}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        base_fare: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Por Minuto (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.per_minute_rate || ''}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        per_minute_rate: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-3">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSave(config.id)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Por KM
                    </span>
                    <span className="font-semibold">R$ {config.price_per_km.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Taxa Base
                    </span>
                    <span className="font-semibold">R$ {config.base_fare.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Por Minuto
                    </span>
                    <span className="font-semibold">R$ {config.per_minute_rate.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Exemplo (5km, 15min)</p>
                      <p className="text-lg font-bold text-viaja-blue">
                        R$ {calculateSamplePrice(config)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant={config.is_active ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleConfigStatus(config.id)}
                    >
                      {config.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-semibold text-blue-900 mb-2">🚗 Tipos de Veículos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">Tradicional:</p>
                <p>Veículos padrão para transporte regular</p>
              </div>
              <div>
                <p className="font-medium">Acessível:</p>
                <p>Veículos adaptados para mobilidade reduzida</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverPricingTab;
