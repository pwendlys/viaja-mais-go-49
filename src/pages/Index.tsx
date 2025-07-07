
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, MapPin, Car, Clock, Star } from 'lucide-react';
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
  
  // Mock data
  const userData = {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    rating: 4.8,
    totalTrips: 47,
    memberSince: '2023'
  };

  const mockDrivers = [
    {
      id: '1',
      lat: -23.5505,
      lng: -46.6333,
      name: 'João Santos',
      rating: 4.9,
      eta: '3 min',
      vehicle: 'Honda Civic Branco',
      plate: 'ABC-1234'
    },
    {
      id: '2',
      lat: -23.5515,
      lng: -46.6343,
      name: 'Ana Costa',
      rating: 4.7,
      eta: '5 min',
      vehicle: 'Toyota Corolla Prata',
      plate: 'DEF-5678'
    },
    {
      id: '3',
      lat: -23.5495,
      lng: -46.6323,
      name: 'Carlos Lima',
      rating: 4.8,
      eta: '7 min',
      vehicle: 'Hyundai HB20 Azul',
      plate: 'GHI-9012'
    }
  ];

  const [currentDriver, setCurrentDriver] = useState(mockDrivers[0]);

  // Welcome toast effect
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success('Bem-vindo ao Viaja+! 🚗', {
        description: 'Sua solução de mobilidade urbana rápida e confiável.'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestRide = (vehicleType: string, pickup: string, destination: string) => {
    setRideState('searching');
    
    // Simulate finding a driver
    setTimeout(() => {
      setRideState('driver-assigned');
      toast.success(`Motorista encontrado! ${currentDriver.name} está a caminho.`);
    }, 2000);
  };

  const handleCancelRide = () => {
    setRideState('idle');
    toast.info('Corrida cancelada');
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

        {/* Demo Map View */}
        <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-blue-200 p-6">
          <div className="h-full flex flex-col">
            <div className="text-center mb-4">
              <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-700">
                Mapa Interativo - São Paulo, SP
              </h3>
              <p className="text-sm text-gray-500">
                Visualização dos motoristas próximos
              </p>
            </div>
            
            {/* Drivers List */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockDrivers.map((driver) => (
                <div 
                  key={driver.id} 
                  className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Car className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{driver.name}</h4>
                      <p className="text-sm text-gray-500">{driver.vehicle}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-gray-600">{driver.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <Clock className="h-3 w-3" />
                      <span>{driver.eta}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ride Interface */}
        <div className="flex justify-center">
          {rideState === 'idle' ? (
            <RideRequest onRequestRide={handleRequestRide} />
          ) : (
            <RideStatus
              status={rideState}
              driver={rideState !== 'searching' ? {
                name: currentDriver.name,
                rating: currentDriver.rating,
                vehicle: currentDriver.vehicle,
                plate: currentDriver.plate,
                eta: currentDriver.eta
              } : undefined}
              onCancel={handleCancelRide}
              onRate={handleRateRide}
            />
          )}
        </div>

        {/* Safety Banner */}
        {rideState === 'idle' && (
          <div className="bg-gradient-viaja-subtle border border-viaja-blue/20 rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-viaja-blue mb-2">
              🛡️ Sua segurança é nossa prioridade
            </div>
            <div className="text-xs text-gray-600">
              Todos os motoristas são verificados • Compartilhe sua viagem • Botão de emergência sempre disponível
            </div>
          </div>
        )}

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-sm font-medium text-yellow-800 mb-1">
            🚀 Modo Demonstração
          </div>
          <div className="text-xs text-yellow-700">
            Esta é uma versão demonstrativa do Viaja+. Em produção, conecte APIs reais de mapeamento e pagamento.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userName={userData.name.split(' ')[0]} 
        onProfileClick={() => setCurrentView('profile')} 
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Index;
