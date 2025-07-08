
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Phone, Plus } from 'lucide-react';
import { useMapboxApi } from '@/hooks/useMapboxApi';
import { toast } from 'sonner';

const Index = () => {
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState<'origin' | 'destination' | null>(null);

  const { searchPlaces, calculateRoute, loading } = useMapboxApi();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setOriginCoords(coords);
          // Reverse geocode to get address
          reverseGeocodeLocation(coords, 'origin');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Não foi possível obter sua localização');
        }
      );
    }
  }, []);

  const reverseGeocodeLocation = async (coords: { lat: number; lng: number }, type: 'origin' | 'destination') => {
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=pk.mapbox.token&language=pt`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        if (type === 'origin') {
          setOriginAddress(address);
        } else {
          setDestinationAddress(address);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleAddressSearch = async (query: string, type: 'origin' | 'destination') => {
    if (!query.trim()) {
      setSuggestions([]);
      setActiveSuggestions(null);
      return;
    }

    try {
      const results = await searchPlaces(query);
      if (results.features) {
        setSuggestions(results.features.slice(0, 5));
        setActiveSuggestions(type);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    }
  };

  const handleSuggestionSelect = (suggestion: any, type: 'origin' | 'destination') => {
    const coords = {
      lat: suggestion.geometry.coordinates[1],
      lng: suggestion.geometry.coordinates[0]
    };

    if (type === 'origin') {
      setOriginAddress(suggestion.place_name);
      setOriginCoords(coords);
    } else {
      setDestinationAddress(suggestion.place_name);
      setDestinationCoords(coords);
    }

    setSuggestions([]);
    setActiveSuggestions(null);
  };

  const handleCalculateRoute = async () => {
    if (!originCoords || !destinationCoords) {
      toast.error('Por favor, selecione origem e destino');
      return;
    }

    try {
      const route = await calculateRoute(originCoords, destinationCoords);
      setRouteInfo(route);
      
      if (route.routes && route.routes.length > 0) {
        const routeData = route.routes[0];
        const distance = (routeData.distance / 1000).toFixed(1);
        const duration = Math.round(routeData.duration / 60);
        
        toast.success(`Rota calculada: ${distance}km, ${duration} minutos`);
      }
    } catch (error) {
      toast.error('Erro ao calcular rota');
    }
  };

  const handleRequestRide = () => {
    if (!routeInfo) {
      toast.error('Calcule a rota primeiro');
      return;
    }

    // Here we would implement the ride request logic
    toast.success('Funcionalidade de solicitação será implementada em breve');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Viaja+
                </h1>
                <p className="text-sm text-gray-600">Transporte Saúde Municipal</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Juiz de Fora - MG
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Viaja+</h2>
              <p className="text-blue-100">
                Transporte gratuito e seguro para consultas médicas e exames de saúde
              </p>
            </CardContent>
          </Card>

          {/* Route Planning Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <span>Solicitar Transporte</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Origin Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local de Partida
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                  <Input
                    placeholder="Digite seu endereço de partida"
                    value={originAddress}
                    onChange={(e) => {
                      setOriginAddress(e.target.value);
                      handleAddressSearch(e.target.value, 'origin');
                    }}
                    className="pl-10"
                  />
                </div>
                
                {activeSuggestions === 'origin' && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion, 'origin')}
                      >
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {suggestion.text}
                            </p>
                            <p className="text-xs text-gray-500">
                              {suggestion.place_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local de Destino
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-600" />
                  <Input
                    placeholder="Hospital, clínica ou endereço de destino"
                    value={destinationAddress}
                    onChange={(e) => {
                      setDestinationAddress(e.target.value);
                      handleAddressSearch(e.target.value, 'destination');
                    }}
                    className="pl-10"
                  />
                </div>
                
                {activeSuggestions === 'destination' && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion, 'destination')}
                      >
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {suggestion.text}
                            </p>
                            <p className="text-xs text-gray-500">
                              {suggestion.place_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculate Route Button */}
              <Button 
                onClick={handleCalculateRoute}
                disabled={!originCoords || !destinationCoords || loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Calculando...' : 'Calcular Rota'}
              </Button>

              {/* Route Information */}
              {routeInfo && routeInfo.routes && routeInfo.routes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Informações da Rota</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Distância</p>
                        <p className="font-semibold">
                          {(routeInfo.routes[0].distance / 1000).toFixed(1)} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Tempo Estimado</p>
                        <p className="font-semibold">
                          {Math.round(routeInfo.routes[0].duration / 60)} min
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleRequestRide}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Solicitar Transporte Gratuito
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact Card */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Emergência Médica</h3>
                  <p className="text-sm text-orange-700">
                    Em caso de emergência, ligue: <strong>192 (SAMU)</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Facilities Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unidades de Saúde Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Hospital Monte Sinai</p>
                    <p className="text-sm text-gray-600">Centro - Juiz de Fora</p>
                  </div>
                  <Badge>Hospital</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">UPA Norte</p>
                    <p className="text-sm text-gray-600">Francisco Bernardino - JF</p>
                  </div>
                  <Badge variant="outline">Clínica</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Hospital Universitário</p>
                    <p className="text-sm text-gray-600">Santa Catarina - JF</p>
                  </div>
                  <Badge>Hospital</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
