
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Car, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RideRequest from '@/components/RideRequest';
import RideStatus from '@/components/RideStatus';
import UserProfile from '@/components/UserProfile';
import SecureMapboxComponent from '@/components/maps/SecureMapboxComponent';
import { toast } from 'sonner';

type AppView = 'map' | 'profile';
type RideState = 'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [rideState, setRideState] = useState<RideState>('idle');
  const [showMenu, setShowMenu] = useState(false);
  
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
      toast.success('Bem-vindo ao Viaja+! 🗺️', {
        description: 'Sua solução de mobilidade urbana com Mapbox integrado.'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestRide = (vehicleType: string, pickup: string, destination: string) => {
    setRideState('searching');
    toast.info('Procurando motoristas disponíveis...');
    
    // Simulate searching - in real app, this would connect to database
    setTimeout(() => {
      toast.info('Nenhum motorista disponível no momento. Cadastre motoristas no sistema.');
      setRideState('idle');
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideState('idle');
    toast.info('Busca cancelada');
  };

  const handleRateRide = (rating: number) => {
    console.log('Avaliação da corrida:', rating);
    toast.success(`Obrigado pela avaliação de ${rating} estrelas!`);
    setRideState('idle');
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
      {/* Header com menu hamburguer */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white/90 backdrop-blur-sm shadow-md"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl font-bold gradient-viaja bg-clip-text text-transparent bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-md">
            Viaja+
          </h1>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white/90 backdrop-blur-sm shadow-md"
            onClick={() => setCurrentView('profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Menu lateral */}
      {showMenu && (
        <div className="absolute top-0 left-0 z-30 w-80 h-full bg-white shadow-xl">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
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
                <Button className="w-full gradient-viaja text-white justify-start">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              
              <Link to="/register" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar
                </Button>
              </Link>
              
              <Link to="/admin/drivers" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Car className="h-4 w-4 mr-2" />
                  Gerenciar Motoristas
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gradient-viaja-subtle border border-viaja-blue/20 rounded-lg">
              <div className="text-sm font-medium text-viaja-blue mb-2">
                🗺️ Mapbox Integrado
              </div>
              <div className="text-xs text-gray-600">
                Sistema com mapas 3D, geolocalização e rotas otimizadas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay quando menu está aberto */}
      {showMenu && (
        <div 
          className="absolute inset-0 bg-black/20 z-25"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Mapa em tela cheia */}
      <div className="absolute inset-0">
        <SecureMapboxComponent 
          className="w-full h-full"
          center={{ lat: -21.7554, lng: -43.3636 }}
          zoom={13}
        />
      </div>

      {/* Controles de corrida na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl">
          <div className="p-6">
            {rideState === 'idle' ? (
              <RideRequest onRequestRide={handleRequestRide} />
            ) : (
              <RideStatus
                status={rideState}
                driver={undefined}
                onCancel={handleCancelRide}
                onRate={handleRateRide}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status de motoristas - card flutuante */}
      <div className="absolute top-20 right-4 z-15">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs">
          <div className="flex items-center space-x-2 text-sm">
            <Car className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium text-gray-800">Sistema Ativo</div>
              <div className="text-gray-600 text-xs">Nenhum motorista cadastrado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
