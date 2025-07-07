
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SecureMapboxAddressAutocomplete from '@/components/maps/SecureMapboxAddressAutocomplete';
import SecureMapboxComponent from '@/components/maps/SecureMapboxComponent';
import { useMapboxApi } from '@/hooks/useMapboxApi';
import { toast } from 'sonner';

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
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{lat: number, lng: number} | null>(null);
  const { calculateRoute, loading } = useMapboxApi();

  // Calculate route when both coordinates are available
  useEffect(() => {
    const getRoute = async () => {
      if (pickupCoords && destinationCoords) {
        try {
          const data = await calculateRoute(pickupCoords, destinationCoords);
          
          if (data.summary) {
            setRouteInfo(data.summary);
            toast.success(`Rota calculada: ${data.summary.distance.text} • ${data.summary.duration.text}`);
          }
        } catch (error) {
          console.error('Route calculation error:', error);
          setRouteInfo(null);
        }
      } else {
        setRouteInfo(null);
      }
    };

    getRoute();
  }, [pickupCoords, destinationCoords, calculateRoute]);

  const calculateFare = (distanceKm: number, durationMinutes: number): number => {
    const baseFare = 5.00;
    const perKmRate = 2.50;
    const perMinuteRate = 0.30;
    
    return baseFare + (distanceKm * perKmRate) + (durationMinutes * perMinuteRate);
  };

  const vehicleOptions: VehicleOption[] = [
    {
      id: 'viaja-economico',
      name: 'Viaja Econômico',
      description: 'Opção mais em conta',
      price: routeInfo ? calculateFare(routeInfo.distance.value / 1000, routeInfo.duration.value / 60) * 0.8 : 12.50,
      eta: '3 min',
      capacity: 4,
      icon: '🚗'
    },
    {
      id: 'viaja-conforto',
      name: 'Viaja Conforto',
      description: 'Mais espaço e conforto',
      price: routeInfo ? calculateFare(routeInfo.distance.value / 1000, routeInfo.duration.value / 60) : 18.90,
      eta: '5 min',
      capacity: 4,
      icon: '🚙'
    },
    {
      id: 'viaja-premium',
      name: 'Viaja Premium',
      description: 'Carros de luxo',
      price: routeInfo ? calculateFare(routeInfo.distance.value / 1000, routeInfo.duration.value / 60) * 1.5 : 28.50,
      eta: '7 min',
      capacity: 4,
      icon: '🚘'
    }
  ];

  const handleRequestRide = () => {
    if (selectedVehicle && destination && pickup) {
      onRequestRide(selectedVehicle, pickup, destination);
    }
  };

  const handlePickupSelect = (place: any) => {
    setPickup(place.description);
    if (place.coordinates) {
      setPickupCoords(place.coordinates);
    }
  };

  const handleDestinationSelect = (place: any) => {
    setDestination(place.description);
    if (place.coordinates) {
      setDestinationCoords(place.coordinates);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mapa Mapbox Seguro */}
      <SecureMapboxComponent 
        className="w-full h-96"
        origin={pickupCoords ? { ...pickupCoords, address: pickup } : undefined}
        destination={destinationCoords ? { ...destinationCoords, address: destination } : undefined}
        center={{ lat: -21.7554, lng: -43.3636 }}
        zoom={13}
      />

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center gradient-viaja bg-clip-text text-transparent">
            Solicitar Corrida
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Pickup and Destination com API segura */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-viaja-blue rounded-full"></div>
              <SecureMapboxAddressAutocomplete
                value={pickup}
                onChange={setPickup}
                placeholder="Ponto de partida"
                className="flex-1"
                onPlaceSelect={handlePickupSelect}
                showCurrentLocationButton={true}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-3 h-3 text-viaja-orange" />
              <SecureMapboxAddressAutocomplete
                value={destination}
                onChange={setDestination}
                placeholder="Para onde você vai?"
                className="flex-1"
                onPlaceSelect={handleDestinationSelect}
                showCurrentLocationButton={false}
              />
            </div>
          </div>

          {/* Route Information */}
          {routeInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-600">Distância:</span>
                    <span className="font-medium ml-1">{routeInfo.distance.text}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tempo:</span>
                    <span className="font-medium ml-1">{routeInfo.duration.text}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            disabled={!selectedVehicle || !destination || !pickup || loading}
            className="w-full gradient-viaja text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Calculando...' : `Solicitar ${selectedVehicle && vehicleOptions.find(v => v.id === selectedVehicle)?.name}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideRequest;
