
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideRequest from '@/components/RideRequest';
import RideStatus from '@/components/RideStatus';
import UserProfile from '@/components/UserProfile';
import { toast } from 'sonner';

type AppView = 'map' | 'profile';
type RideState = 'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [rideState, setRideState] = useState<RideState>('idle');
  
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

  const renderMainContent = () => {
    if (currentView === 'profile') {
      return (
        <UserProfile 
          user={userData} 
          onClose={() => setCurrentView('map')} 
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Auth Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <Link to="/login">
            <Button className="gradient-viaja text-white">
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar
            </Button>
          </Link>
        </div>

        {/* Ride Interface com Mapbox Integrado */}
        <div className="flex justify-center">
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

        {/* Empty State for Drivers */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Car className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Nenhum Motorista Cadastrado
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            Para começar a usar o sistema, cadastre motoristas através do painel administrativo.
          </p>
          <Link to="/admin/drivers">
            <Button variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
              Gerenciar Motoristas
            </Button>
          </Link>
        </div>

        {/* System Status */}
        <div className="bg-gradient-viaja-subtle border border-viaja-blue/20 rounded-lg p-4 text-center">
          <div className="text-sm font-medium text-viaja-blue mb-2">
            🗺️ Mapbox Integrado com Visão 3D
          </div>
          <div className="text-xs text-gray-600">
            Sistema atualizado com mapas Mapbox, construções 3D, geolocalização e rotas otimizadas
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userName={userData.name} 
        onProfileClick={() => setCurrentView('profile')} 
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Index;
