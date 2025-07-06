
import React, { useState } from 'react';
import { MapPin, Clock, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VehicleOption {
  id: string;
  name: string;
  description: string;
  price: number;
  eta: string;
  capacity: number;
  icon: string;
}

interface RideRequestProps {
  onRequestRide: (vehicleType: string, pickup: string, destination: string) => void;
}

const RideRequest = ({ onRequestRide }: RideRequestProps) => {
  const [pickup, setPickup] = useState('Minha localização atual');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const vehicleOptions: VehicleOption[] = [
    {
      id: 'viaja-economico',
      name: 'Viaja Econômico',
      description: 'Opção mais em conta',
      price: 12.50,
      eta: '3 min',
      capacity: 4,
      icon: '🚗'
    },
    {
      id: 'viaja-conforto',
      name: 'Viaja Conforto',
      description: 'Mais espaço e conforto',
      price: 18.90,
      eta: '5 min',
      capacity: 4,
      icon: '🚙'
    },
    {
      id: 'viaja-premium',
      name: 'Viaja Premium',
      description: 'Carros de luxo',
      price: 28.50,
      eta: '7 min',
      capacity: 4,
      icon: '🚘'
    }
  ];

  const handleRequestRide = () => {
    if (selectedVehicle && destination) {
      onRequestRide(selectedVehicle, pickup, destination);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center gradient-viaja bg-clip-text text-transparent">
          Solicitar Corrida
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pickup and Destination */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-viaja-blue rounded-full"></div>
            <Input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Ponto de partida"
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-3 h-3 text-viaja-orange" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Para onde você vai?"
              className="flex-1"
            />
          </div>
        </div>

        {/* Vehicle Options */}
        {destination && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Escolha seu veículo:</h3>
            
            {vehicleOptions.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'border-viaja-blue bg-gradient-viaja-subtle'
                    : 'border-gray-200 hover:border-viaja-blue/50'
                }`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{vehicle.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{vehicle.name}</div>
                      <div className="text-sm text-gray-600">{vehicle.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {vehicle.eta}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {vehicle.capacity} pessoas
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-viaja-blue">
                      R$ {vehicle.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Method */}
        {selectedVehicle && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Cartão de Crédito</span>
              </div>
              <button className="text-sm text-viaja-blue hover:underline">
                Alterar
              </button>
            </div>
          </div>
        )}

        {/* Request Button */}
        <Button
          onClick={handleRequestRide}
          disabled={!selectedVehicle || !destination}
          className="w-full gradient-viaja text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Solicitar {selectedVehicle && vehicleOptions.find(v => v.id === selectedVehicle)?.name}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RideRequest;
