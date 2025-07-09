
import React, { useState } from 'react';
import { DollarSign, Save, Plus, Edit, Car, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePricingData } from '@/hooks/usePricingData';

const PricingConfig = () => {
  const { pricingConfigs, isLoading, addPricingConfig, updatePricingConfig, toggleConfigStatus } = usePricingData();
  const [isAddingConfig, setIsAddingConfig] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [newConfig, setNewConfig] = useState({
    vehicle_type: '',
    price_per_km: 0,
    base_fare: 0,
    per_minute_rate: 0
  });

  // Mock admin data
  const mockAdmin = {
    name: 'Admin Municipal',
    email: 'admin@prefeitura.gov.br',
    role: 'Administrador'
  };

  const handleAddConfig = async () => {
    if (newConfig.vehicle_type && newConfig.price_per_km > 0) {
      const success = await addPricingConfig({
        ...newConfig,
        is_active: true
      });
      
      if (success) {
        setNewConfig({
          vehicle_type: '',
          price_per_km: 0,
          base_fare: 0,
          per_minute_rate: 0
        });
        setIsAddingConfig(false);
      }
    }
  };

  const handleEditConfig = (config: any) => {
    setEditingConfig(config);
  };

  const handleUpdateConfig = async () => {
    if (editingConfig) {
      await updatePricingConfig(editingConfig.id, {
        price_per_km: editingConfig.price_per_km,
        base_fare: editingConfig.base_fare,
        per_minute_rate: editingConfig.per_minute_rate
      });
      setEditingConfig(null);
    }
  };

  const calculateSamplePrice = (config: any, distance: number = 5, duration: number = 15) => {
    return (config.base_fare + (config.price_per_km * distance) + (config.per_minute_rate * duration)).toFixed(2);
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels = {
      'economico': 'Econômico',
      'conforto': 'Conforto',
      'premium': 'Premium',
      'standard': 'Padrão'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader admin={mockAdmin} />
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Carregando configurações...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={mockAdmin} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configuração de Preços</h1>
              <p className="text-gray-600">Gerencie os valores cobrados por quilômetro e tempo</p>
            </div>
            
            <Dialog open={isAddingConfig} onOpenChange={setIsAddingConfig}>
              <DialogTrigger asChild>
                <Button className="gradient-viaja text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Configuração
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Configuração de Preço</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                    <Select value={newConfig.vehicle_type} onValueChange={(value) => setNewConfig({...newConfig, vehicle_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economico">Econômico</SelectItem>
                        <SelectItem value="conforto">Conforto</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="accessibility">Acessibilidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerKm">Preço por KM (R$)</Label>
                      <Input
                        id="pricePerKm"
                        type="number"
                        step="0.10"
                        value={newConfig.price_per_km}
                        onChange={(e) => setNewConfig({...newConfig, price_per_km: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="baseFare">Taxa Base (R$)</Label>
                      <Input
                        id="baseFare"
                        type="number"
                        step="0.10"
                        value={newConfig.base_fare}
                        onChange={(e) => setNewConfig({...newConfig, base_fare: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="perMinuteRate">Por Minuto (R$)</Label>
                      <Input
                        id="perMinuteRate"
                        type="number"
                        step="0.01"
                        value={newConfig.per_minute_rate}
                        onChange={(e) => setNewConfig({...newConfig, per_minute_rate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsAddingConfig(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 gradient-viaja text-white"
                      onClick={handleAddConfig}
                    >
                      Adicionar Configuração
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      onClick={() => handleEditConfig(config)}
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Dialog */}
          <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Configuração de Preço</DialogTitle>
              </DialogHeader>
              
              {editingConfig && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Veículo</Label>
                    <p className="text-sm font-medium">{getVehicleTypeLabel(editingConfig.vehicle_type)}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPricePerKm">Preço por KM (R$)</Label>
                      <Input
                        id="editPricePerKm"
                        type="number"
                        step="0.10"
                        value={editingConfig.price_per_km}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig, 
                          price_per_km: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="editBaseFare">Taxa Base (R$)</Label>
                      <Input
                        id="editBaseFare"
                        type="number"
                        step="0.10"
                        value={editingConfig.base_fare}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig, 
                          base_fare: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="editPerMinuteRate">Por Minuto (R$)</Label>
                      <Input
                        id="editPerMinuteRate"
                        type="number"
                        step="0.01"
                        value={editingConfig.per_minute_rate}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig, 
                          per_minute_rate: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setEditingConfig(null)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 gradient-viaja text-white"
                      onClick={handleUpdateConfig}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Summary Card */}
          <Card className="bg-gradient-viaja-subtle border-viaja-blue/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-viaja-blue mb-2">💡 Informações sobre Preços</h3>
                <p className="text-sm text-gray-700">
                  Os preços são calculados automaticamente com base na distância percorrida e tempo de viagem.
                  Os usuários não veem estes valores, pois o transporte é gratuito e custeado pela prefeitura.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingConfig;
