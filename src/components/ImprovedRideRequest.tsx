
import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ImprovedAddressAutocomplete from '@/components/maps/ImprovedAddressAutocomplete';
import { toast } from 'sonner';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ImprovedRideRequestProps {
  onRequestRide: (vehicleType: string, pickup: string, destination: string) => void;
  prefilledDestination?: string;
  onRouteChange?: (origin: Location | null, destination: Location | null) => void;
}

const ImprovedRideRequest = ({ 
  onRequestRide, 
  prefilledDestination = '',
  onRouteChange 
}: ImprovedRideRequestProps) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState(prefilledDestination);
  const [selectedVehicle, setSelectedVehicle] = useState('economico');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');

  const vehicleOptions = [
    {
      id: 'economico',
      name: 'Econômico',
      description: 'Opção mais em conta',
      icon: '🚗',
      priceMultiplier: 1.0,
      eta: '5-10 min'
    },
    {
      id: 'conforto',
      name: 'Conforto',
      description: 'Mais espaço e conforto',
      icon: '🚙',
      priceMultiplier: 1.3,
      eta: '5-10 min'
    },
    {
      id: 'acessivel',
      name: 'Acessível',
      description: 'Veículo adaptado',
      icon: '♿',
      priceMultiplier: 1.0,
      eta: '10-15 min'
    }
  ];

  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
    if (onRouteChange) {
      onRouteChange(location, destinationLocation);
    }
  };

  const handleDestinationSelect = (location: Location) => {
    setDestinationLocation(location);
    if (onRouteChange) {
      onRouteChange(pickupLocation, location);
    }
  };

  const handleRequestRide = () => {
    if (!pickup.trim()) {
      toast.error('Por favor, informe o local de origem');
      return;
    }
    
    if (!destination.trim()) {
      toast.error('Por favor, informe o destino');
      return;
    }

    onRequestRide(selectedVehicle, pickup, destination);
  };

  const canRequestRide = pickup.trim() && destination.trim();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-viaja-blue" />
          <span>Solicitar Transporte</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pickup Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Origem</span>
          </label>
          <ImprovedAddressAutocomplete
            value={pickup}
            onChange={setPickup}
            onLocationSelect={handlePickupSelect}
            placeholder="Digite o endereço de origem..."
            className="w-full"
          />
        </div>

        {/* Destination Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Destino</span>
          </label>
          <ImprovedAddressAutocomplete
            value={destination}
            onChange={setDestination}
            onLocationSelect={handleDestinationSelect}
            placeholder="Digite o endereço de destino..."
            className="w-full"
          />
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Tipo de Veículo
          </label>
          <div className="space-y-2">
            {vehicleOptions.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'border-viaja-blue bg-gradient-viaja-subtle'
                    : 'border-gray-200 hover:border-viaja-blue/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{vehicle.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {vehicle.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {vehicle.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {vehicle.eta}
                    </Badge>
                    {vehicle.id === 'acessivel' && (
                      <div className="text-xs text-viaja-blue mt-1">
                        Gratuito
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Route Information */}
        {estimatedTime && estimatedPrice && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Tempo estimado:</span>
              </div>
              <span className="font-medium">{estimatedTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Preço estimado:</span>
              </div>
              <span className="font-medium text-viaja-blue">{estimatedPrice}</span>
            </div>
          </div>
        )}

        {/* Service Notice */}
        <div className="bg-gradient-viaja-subtle p-3 rounded-lg border border-viaja-blue/20">
          <div className="text-center">
            <p className="text-sm text-viaja-blue font-medium mb-1">
              🚗 Transporte Municipal Gratuito
            </p>
            <p className="text-xs text-gray-700">
              Serviço oferecido pela Prefeitura de Juiz de Fora
            </p>
          </div>
        </div>

        {/* Request Button */}
        <Button
          onClick={handleRequestRide}
          disabled={!canRequestRide}
          className="w-full gradient-viaja text-white"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Solicitar Transporte
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImprovedRideRequest;
