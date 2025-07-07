
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CreditCard, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddressAutocomplete from '@/components/maps/AddressAutocomplete';
import InteractiveMap from '@/components/maps/InteractiveMap';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
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
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const { getDirections, geocodeAddress, calculateFare, loading } = useGoogleMaps();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setPickup('Minha localização atual');
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setPickup('');
        }
      );
    }
  }, []);

  // Calculate route when both addresses are set
  useEffect(() => {
    const calculateRoute = async () => {
      if (pickup && destination && pickup !== destination) {
        try {
          const directions = await getDirections(pickup, destination);
          if (directions?.summary) {
            setRouteInfo(directions.summary);
            
            // Update vehicle prices based on distance
            const distanceKm = directions.summary.distance.value / 1000;
            const durationMinutes = directions.summary.duration.value / 60;
            const baseFare = calculateFare(distanceKm, durationMinutes);
            
            toast.success(`Rota calculada: ${directions.summary.distance.text} • ${directions.summary.duration.text}`);
          }
        } catch (error) {
          console.error('Route calculation error:', error);
          setRouteInfo(null);
        }
      } else {
        setRouteInfo(null);
      }
    };

    calculateRoute();
  }, [pickup, destination, getDirections, calculateFare]);

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

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setPickup('Minha localização atual');
        },
        (error) => {
          toast.error('Não foi possível obter sua localização');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocalização não é suportada neste dispositivo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <InteractiveMap 
        className="w-full"
        origin={currentLocation ? { ...currentLocation, address: pickup } : undefined}
        destination={routeInfo ? { lat: 0, lng: 0, address: destination } : undefined}
      />

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
              <div className="flex-1 flex space-x-2">
                <AddressAutocomplete
                  value={pickup}
                  onChange={setPickup}
                  placeholder="Ponto de partida"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  className="shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-3 h-3 text-viaja-orange" />
              <AddressAutocomplete
                value={destination}
                onChange={setDestination}
                placeholder="Para onde você vai?"
                className="flex-1"
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
