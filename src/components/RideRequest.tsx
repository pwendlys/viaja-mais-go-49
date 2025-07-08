
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Accessibility, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SecureMapboxAddressAutocomplete from '@/components/maps/SecureMapboxAddressAutocomplete';
import { useMapboxApi } from '@/hooks/useMapboxApi';
import { toast } from 'sonner';

interface VehicleOption {
  id: string;
  name: string;
  description: string;
  eta: string;
  capacity: number;
  icon: string;
  wheelchairAccessible: boolean;
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
  const [needsWheelchairAccess, setNeedsWheelchairAccess] = useState(false);
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

  // Vehicle options without prices, only showing ETA
  const vehicleOptions: VehicleOption[] = [
    {
      id: 'viaja-economico',
      name: 'Viaja Econômico',
      description: 'Veículo padrão para transporte',
      eta: '5-8 min',
      capacity: 4,
      icon: '🚗',
      wheelchairAccessible: false
    },
    {
      id: 'viaja-conforto',
      name: 'Viaja Conforto',
      description: 'Mais espaço e conforto',
      eta: '8-12 min',
      capacity: 4,
      icon: '🚙',
      wheelchairAccessible: false
    },
    {
      id: 'viaja-acessivel',
      name: 'Viaja Acessível',
      description: 'Veículo adaptado para cadeirantes',
      eta: '10-15 min',
      capacity: 3,
      icon: '♿',
      wheelchairAccessible: true
    }
  ];

  // Filter vehicles based on wheelchair accessibility need
  const availableVehicles = needsWheelchairAccess 
    ? vehicleOptions.filter(v => v.wheelchairAccessible)
    : vehicleOptions;

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
    <div className="space-y-4">
      {/* Campos de origem e destino */}
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

      {/* Wheelchair Accessibility Option */}
      {destination && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <Accessibility className="w-5 h-5 text-viaja-blue" />
            <div className="flex-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsWheelchairAccess}
                  onChange={(e) => {
                    setNeedsWheelchairAccess(e.target.checked);
                    setSelectedVehicle(''); // Reset selection when accessibility changes
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Preciso de veículo acessível para cadeira de rodas
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Options */}
      {destination && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Escolha seu veículo:</h3>
          
          {availableVehicles.map((vehicle) => (
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
                      {vehicle.wheelchairAccessible && (
                        <Badge variant="outline" className="text-xs border-viaja-blue text-viaja-blue">
                          <Accessibility className="w-3 h-3 mr-1" />
                          Acessível
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg text-viaja-green">
                    Gratuito
                  </div>
                  <div className="text-xs text-gray-500">
                    Prefeitura de JF
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Information */}
      {selectedVehicle && (
        <div className="border rounded-lg p-3 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">
              Serviço 100% gratuito oferecido pela Prefeitura Municipal
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Destinado exclusivamente para consultas médicas e exames de saúde
          </p>
        </div>
      )}

      {/* Request Button */}
      <Button
        onClick={handleRequestRide}
        disabled={!selectedVehicle || !destination || !pickup || loading}
        className="w-full gradient-viaja text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Calculando...' : `Solicitar ${selectedVehicle && availableVehicles.find(v => v.id === selectedVehicle)?.name}`}
      </Button>
    </div>
  );
};

export default RideRequest;
