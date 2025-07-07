
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMapboxApi } from '@/hooks/useMapboxApi';
import { toast } from 'sonner';

interface InteractiveRideMapProps {
  onRideRequest?: (origin: any, destination: any, vehicleType: string) => void;
  className?: string;
}

const InteractiveRideMap = ({ onRideRequest, className = "" }: InteractiveRideMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState('viaja-economico');
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [clickMode, setClickMode] = useState<'origin' | 'destination'>('origin');
  
  const { calculateRoute, reverseGeocode, loading } = useMapboxApi();
  const mapboxToken = localStorage.getItem('mapbox_token');

  // Veículo options with pricing
  const vehicleOptions = [
    {
      id: 'viaja-economico',
      name: 'Econômico',
      icon: '🚗',
      priceMultiplier: 0.8,
      eta: '3-5 min'
    },
    {
      id: 'viaja-conforto',
      name: 'Conforto',
      icon: '🚙',
      priceMultiplier: 1.0,
      eta: '5-7 min'
    },
    {
      id: 'viaja-premium',
      name: 'Premium',
      icon: '🚘',
      priceMultiplier: 1.5,
      eta: '7-10 min'
    }
  ];

  const calculateFare = (distanceKm: number, durationMinutes: number, multiplier: number = 1): number => {
    const baseFare = 5.00;
    const perKmRate = 2.50;
    const perMinuteRate = 0.30;
    
    return (baseFare + (distanceKm * perKmRate) + (durationMinutes * perMinuteRate)) * multiplier;
  };

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-43.3636, -21.7554], // Juiz de Fora
      zoom: 13,
      pitch: 0, // Keep flat for better interaction
      bearing: 0
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Add navigation controls
      map.current!.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add click handler for setting origin/destination
      map.current!.on('click', handleMapClick);
      
      // Change cursor to pointer
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    
    try {
      // Get address from coordinates
      const addressData = await reverseGeocode(lat, lng);
      const address = addressData?.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      const location = { lat, lng, address };
      
      if (clickMode === 'origin') {
        setOrigin(location);
        setClickMode('destination');
        toast.success('📍 Origem definida! Agora clique no destino.');
      } else {
        setDestination(location);
        toast.success('🎯 Destino definido! Calculando rota...');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      const location = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
      
      if (clickMode === 'origin') {
        setOrigin(location);
        setClickMode('destination');
        toast.success('📍 Origem definida! Agora clique no destino.');
      } else {
        setDestination(location);
        toast.success('🎯 Destino definido! Calculando rota...');
      }
    }
  };

  // Calculate route when both points are set
  useEffect(() => {
    const getRoute = async () => {
      if (origin && destination && map.current) {
        try {
          const data = await calculateRoute(origin, destination);
          
          if (data.routes && data.routes[0]) {
            setRouteInfo(data.summary || {
              distance: { value: data.routes[0].distance, text: `${(data.routes[0].distance / 1000).toFixed(1)} km` },
              duration: { value: data.routes[0].duration, text: `${Math.round(data.routes[0].duration / 60)} min` }
            });
            
            // Draw route on map
            const route = data.routes[0];
            
            if (map.current!.getSource('route')) {
              map.current!.removeLayer('route');
              map.current!.removeSource('route');
            }
            
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            });
            
            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#4285F4',
                'line-width': 6,
                'line-opacity': 0.8
              }
            });
            
            // Fit map to route
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([origin.lng, origin.lat]);
            bounds.extend([destination.lng, destination.lat]);
            map.current!.fitBounds(bounds, { padding: 100 });
          }
        } catch (error) {
          console.error('Error calculating route:', error);
          toast.error('Erro ao calcular rota');
        }
      }
    };

    getRoute();
  }, [origin, destination, calculateRoute]);

  // Update markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    const newMarkers: mapboxgl.Marker[] = [];

    // Origin marker
    if (origin) {
      const originElement = document.createElement('div');
      originElement.innerHTML = '📍';
      originElement.style.cssText = `
        font-size: 24px;
        background: white;
        border-radius: 50%;
        padding: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      
      const originMarker = new mapboxgl.Marker({ element: originElement })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>Origem</strong><br/>${origin.address}`))
        .addTo(map.current);
      newMarkers.push(originMarker);
    }

    // Destination marker
    if (destination) {
      const destElement = document.createElement('div');
      destElement.innerHTML = '🎯';
      destElement.style.cssText = `
        font-size: 24px;
        background: white;
        border-radius: 50%;
        padding: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      
      const destMarker = new mapboxgl.Marker({ element: destElement })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>Destino</strong><br/>${destination.address}`))
        .addTo(map.current);
      newMarkers.push(destMarker);
    }

    setMarkers(newMarkers);
  }, [isLoaded, origin, destination]);

  const resetRoute = () => {
    setOrigin(null);
    setDestination(null);
    setRouteInfo(null);
    setClickMode('origin');
    
    // Remove route from map
    if (map.current && map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    
    // Clear markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);
    
    toast.info('Rota limpa. Clique para definir uma nova origem.');
  };

  const handleRequestRide = () => {
    if (origin && destination && onRideRequest) {
      onRideRequest(origin, destination, selectedVehicle);
    }
  };

  if (!mapboxToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg`}>
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🗺️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Mapa Interativo
          </h3>
          <p className="text-sm text-gray-600">
            Configure a chave do Mapbox para ativar o mapa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${clickMode === 'origin' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium">
                  {clickMode === 'origin' ? '📍 Clique para definir origem' : '🎯 Clique para definir destino'}
                </span>
              </div>
              {(origin || destination) && (
                <Button variant="ghost" size="sm" onClick={resetRoute}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route info and vehicle selection */}
      {routeInfo && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              {/* Route Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Distância:</span>
                    <span className="font-medium ml-1">{routeInfo.distance?.text}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Tempo:</span>
                    <span className="font-medium ml-1">{routeInfo.duration?.text}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Escolha seu veículo:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {vehicleOptions.map((vehicle) => {
                    const price = calculateFare(
                      routeInfo.distance?.value / 1000 || 0,
                      routeInfo.duration?.value / 60 || 0,
                      vehicle.priceMultiplier
                    );
                    
                    return (
                      <button
                        key={vehicle.id}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedVehicle === vehicle.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                      >
                        <div className="text-lg mb-1">{vehicle.icon}</div>
                        <div className="text-xs font-medium text-gray-800">{vehicle.name}</div>
                        <div className="text-sm font-bold text-blue-600">R$ {price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{vehicle.eta}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Request Button */}
              <Button
                onClick={handleRequestRide}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Solicitar Corrida'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveRideMap;
