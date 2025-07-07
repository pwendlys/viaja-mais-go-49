
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Car, Menu, User, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RideStatus from '@/components/RideStatus';
import UserProfile from '@/components/UserProfile';
import SecureMapboxComponent from '@/components/maps/SecureMapboxComponent';
import SecureMapboxAddressAutocomplete from '@/components/maps/SecureMapboxAddressAutocomplete';
import { toast } from 'sonner';

type AppView = 'map' | 'profile';
type RideState = 'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [rideState, setRideState] = useState<RideState>('idle');
  const [showMenu, setShowMenu] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  
  // User data - will come from database
  const userData = {
    name: 'Usuário',
    email: 'usuario@email.com',
    rating: 0,
    totalTrips: 0,
    memberSince: '2024'
  };

  // Welcome toast effect
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success('Bem-vindo ao Viaja+ 3D! 🌟', {
        description: 'Escolha seus locais de partida e destino para solicitar uma corrida.'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleOriginSelect = (place: any) => {
    if (place.coordinates) {
      setOrigin({
        lat: place.coordinates.lat,
        lng: place.coordinates.lng,
        address: place.description
      });
      setOriginAddress(place.description);
      toast.success('📍 Local de partida definido!');
    }
  };

  const handleDestinationSelect = (place: any) => {
    if (place.coordinates) {
      setDestination({
        lat: place.coordinates.lat,
        lng: place.coordinates.lng,
        address: place.description
      });
      setDestinationAddress(place.description);
      toast.success('🎯 Destino definido!');
    }
  };

  const handleMapClick = (location: { lat: number; lng: number }) => {
    if (!origin) {
      setOrigin({ ...location, address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` });
      setOriginAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      toast.success('📍 Local de partida definido pelo mapa!');
    } else if (!destination) {
      setDestination({ ...location, address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` });
      setDestinationAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      toast.success('🎯 Destino definido pelo mapa!');
    } else {
      // Reset and start over
      setOrigin({ ...location, address: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` });
      setOriginAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      setDestination(null);
      setDestinationAddress('');
      toast.info('📍 Novo local de partida definido! Escolha o destino.');
    }
  };

  const handleRequestRide = () => {
    if (!origin || !destination) {
      toast.error('Por favor, defina origem e destino antes de solicitar a corrida.');
      return;
    }

    setRideState('searching');
    toast.info('🔍 Procurando motoristas na região...', {
      description: `Rota: ${origin.address} → ${destination.address}`
    });
    
    // Simulate searching - in real app, this would connect to database
    setTimeout(() => {
      toast.info('⚠️ Nenhum motorista disponível no momento', {
        description: 'Cadastre motoristas no sistema para ativar as corridas.'
      });
      setRideState('idle');
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideState('idle');
    toast.info('❌ Busca cancelada');
  };

  const handleRateRide = (rating: number) => {
    console.log('Avaliação da corrida:', rating);
    toast.success(`⭐ Obrigado pela avaliação de ${rating} estrelas!`);
    setRideState('idle');
  };

  const resetLocations = () => {
    setOrigin(null);
    setDestination(null);
    setOriginAddress('');
    setDestinationAddress('');
    toast.info('Locais limpos. Defina nova origem e destino.');
  };

  if (currentView === 'profile') {
    return (
      <UserProfile 
        user={userData} 
        onClose={() => setCurrentView('map')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header com controles */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-gray-100"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl shadow-md">
            <h1 className="text-xl font-bold">Viaja+ 3D</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-gray-100"
            onClick={() => setCurrentView('profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>

        {/* Botões de seleção de local */}
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <SecureMapboxAddressAutocomplete
              value={originAddress}
              onChange={setOriginAddress}
              placeholder="Escolher Local de Partida"
              className="flex-1"
              onPlaceSelect={handleOriginSelect}
              showCurrentLocationButton={true}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-3 h-3 text-red-500" />
            <SecureMapboxAddressAutocomplete
              value={destinationAddress}
              onChange={setDestinationAddress}
              placeholder="Escolher Local de Destino"
              className="flex-1"
              onPlaceSelect={handleDestinationSelect}
              showCurrentLocationButton={false}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex space-x-2">
            {origin && destination && (
              <Button
                onClick={handleRequestRide}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={rideState !== 'idle'}
              >
                <Car className="h-4 w-4 mr-2" />
                Solicitar Corrida
              </Button>
            )}
            
            {(origin || destination) && (
              <Button
                onClick={resetLocations}
                variant="outline"
                className="px-4"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Menu lateral */}
      {showMenu && (
        <>
          <div className="absolute top-0 left-0 z-30 w-80 h-full bg-white/95 backdrop-blur-xl shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Menu Principal</h2>
                  <p className="text-sm text-gray-600">Navegação do sistema</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowMenu(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white justify-start shadow-md hover:shadow-lg">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar no Sistema
                  </Button>
                </Link>
                
                <Link to="/register" className="block">
                  <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Conta
                  </Button>
                </Link>
                
                <Link to="/admin/drivers" className="block">
                  <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                    <Car className="h-4 w-4 mr-2" />
                    Gerenciar Motoristas
                  </Button>
                </Link>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <div className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  🗺️ Mapa Interativo 3D
                </div>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>✓ Digite endereços ou clique no mapa</p>
                  <p>✓ Visualização 3D com prédios extrudados</p>
                  <p>✓ Camada de tráfego em tempo real</p>
                  <p>✓ Cálculo automático de rota</p>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-25"
            onClick={() => setShowMenu(false)}
          />
        </>
      )}

      {/* Mapa 3D em tela cheia */}
      <div className="absolute inset-0 pt-32">
        <SecureMapboxComponent
          origin={origin}
          destination={destination}
          onLocationSelect={handleMapClick}
          className="w-full h-full"
          center={{ lat: -21.7554, lng: -43.3636 }} // Juiz de Fora
          zoom={15}
        />
      </div>

      {/* Status da corrida quando ativa */}
      {rideState !== 'idle' && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl">
            <div className="p-6">
              <RideStatus
                status={rideState}
                driver={undefined}
                onCancel={handleCancelRide}
                onRate={handleRateRide}
              />
            </div>
          </div>
        </div>
      )}

      {/* Instruções flutuantes */}
      <div className="absolute bottom-4 left-4 right-4 z-15">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">
                {!origin ? 'Digite o endereço ou clique no mapa para definir origem' : 
                 !destination ? 'Digite o endereço ou clique no mapa para definir destino' : 
                 'Origem e destino definidos! Solicite sua corrida.'}
              </div>
              <div className="text-gray-600 text-xs">
                {origin && destination ? 
                  'Visualize a rota calculada no mapa 3D' : 
                  'Use os campos acima ou toque no mapa'}
              </div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-gray-500">Mapa 3D carregado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
