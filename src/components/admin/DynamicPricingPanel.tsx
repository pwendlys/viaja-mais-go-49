
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePricingSystem } from '@/hooks/usePricingSystem';
import { Car, Clock, DollarSign, Plus, Settings, TrendingUp } from 'lucide-react';

const DynamicPricingPanel = () => {
  const { vehicleTypes, pricingRules, calculatePrice, createVehicleType, updateVehicleType } = usePricingSystem();
  const [newVehicleType, setNewVehicleType] = useState({
    name: '',
    description: '',
    baseRate: 0,
    perKmRate: 0,
    perMinuteRate: 0
  });
  const [priceCalculator, setPriceCalculator] = useState({
    vehicleTypeId: '',
    distance: 0,
    duration: 0,
    isElderly: false,
    hasDisability: false
  });
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const handleCreateVehicleType = async () => {
    try {
      await createVehicleType(newVehicleType);
      setNewVehicleType({
        name: '',
        description: '',
        baseRate: 0,
        perKmRate: 0,
        perMinuteRate: 0
      });
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleCalculatePrice = () => {
    if (!priceCalculator.vehicleTypeId || !priceCalculator.distance) return;

    try {
      const result = calculatePrice(
        priceCalculator.vehicleTypeId,
        priceCalculator.distance,
        priceCalculator.duration,
        priceCalculator.isElderly,
        priceCalculator.hasDisability
      );
      setCalculatedPrice(result);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sistema de Precificação Dinâmica</h2>
      </div>

      <Tabs defaultValue="vehicle-types" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vehicle-types">Tipos de Veículos</TabsTrigger>
          <TabsTrigger value="pricing-rules">Regras de Preço</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicle-types" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tipos de Veículos</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Tipo de Veículo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Tipo</Label>
                    <Input
                      id="name"
                      value={newVehicleType.name}
                      onChange={(e) => setNewVehicleType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Econômico, Conforto, Premium"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={newVehicleType.description}
                      onChange={(e) => setNewVehicleType(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do tipo de veículo"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="baseRate">Tarifa Base (R$)</Label>
                      <Input
                        id="baseRate"
                        type="number"
                        step="0.01"
                        value={newVehicleType.baseRate}
                        onChange={(e) => setNewVehicleType(prev => ({ ...prev, baseRate: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perKmRate">Por KM (R$)</Label>
                      <Input
                        id="perKmRate"
                        type="number"
                        step="0.01"
                        value={newVehicleType.perKmRate}
                        onChange={(e) => setNewVehicleType(prev => ({ ...prev, perKmRate: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perMinuteRate">Por Minuto (R$)</Label>
                      <Input
                        id="perMinuteRate"
                        type="number"
                        step="0.01"
                        value={newVehicleType.perMinuteRate}
                        onChange={(e) => setNewVehicleType(prev => ({ ...prev, perMinuteRate: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateVehicleType} className="w-full">
                    Criar Tipo de Veículo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleTypes.map(vehicleType => (
              <Card key={vehicleType.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>{vehicleType.name}</span>
                    </span>
                    <Badge variant={vehicleType.isActive ? 'default' : 'secondary'}>
                      {vehicleType.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{vehicleType.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tarifa Base:</span>
                      <span className="font-semibold">R$ {vehicleType.baseRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Por KM:</span>
                      <span className="font-semibold">R$ {vehicleType.perKmRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Por Minuto:</span>
                      <span className="font-semibold">R$ {vehicleType.perMinuteRate.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing-rules" className="space-y-4">
          <h3 className="text-lg font-semibold">Regras de Precificação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingRules.map(rule => (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>{rule.name}</span>
                    </span>
                    <Switch checked={rule.isActive} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Multiplicador:</span>
                    <Badge variant="outline">{rule.multiplier}x</Badge>
                  </div>
                  
                  {rule.timeStart && rule.timeEnd && (
                    <div className="flex justify-between">
                      <span className="text-sm">Horário:</span>
                      <span className="text-sm">{rule.timeStart} - {rule.timeEnd}</span>
                    </div>
                  )}
                  
                  {rule.dayOfWeek && (
                    <div className="flex justify-between">
                      <span className="text-sm">Dias:</span>
                      <span className="text-sm">
                        {rule.dayOfWeek.map(day => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day]).join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <h3 className="text-lg font-semibold">Calculadora de Preços</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros da Corrida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                  <select
                    id="vehicleType"
                    value={priceCalculator.vehicleTypeId}
                    onChange={(e) => setPriceCalculator(prev => ({ ...prev, vehicleTypeId: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione um tipo</option>
                    {vehicleTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="distance">Distância (KM)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={priceCalculator.distance}
                    onChange={(e) => setPriceCalculator(prev => ({ ...prev, distance: parseFloat(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duração (Minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={priceCalculator.duration}
                    onChange={(e) => setPriceCalculator(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={priceCalculator.isElderly}
                      onCheckedChange={(checked) => setPriceCalculator(prev => ({ ...prev, isElderly: checked }))}
                    />
                    <Label>Idoso (15% desconto)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={priceCalculator.hasDisability}
                      onCheckedChange={(checked) => setPriceCalculator(prev => ({ ...prev, hasDisability: checked }))}
                    />
                    <Label>Pessoa com Deficiência (20% desconto)</Label>
                  </div>
                </div>
                
                <Button onClick={handleCalculatePrice} className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calcular Preço
                </Button>
              </CardContent>
            </Card>

            {calculatedPrice && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Resultado do Cálculo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tarifa Base:</span>
                      <span>R$ {calculatedPrice.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço por Distância:</span>
                      <span>R$ {calculatedPrice.distancePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço por Tempo:</span>
                      <span>R$ {calculatedPrice.timePrice.toFixed(2)}</span>
                    </div>
                    
                    {calculatedPrice.multiplierApplied > 1 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Multiplicador:</span>
                        <span>{calculatedPrice.multiplierApplied}x</span>
                      </div>
                    )}
                    
                    {calculatedPrice.discountApplied > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto:</span>
                        <span>-{(calculatedPrice.discountApplied * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Preço Final:</span>
                      <span className="text-viaja-green">R$ {calculatedPrice.finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {calculatedPrice.appliedRules.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Regras Aplicadas:</p>
                      <div className="space-y-1">
                        {calculatedPrice.appliedRules.map((rule, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Relatórios de faturamento e histórico de alterações de preços em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DynamicPricingPanel;
