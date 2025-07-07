import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import GoogleMapComponent from '@/components/maps/GoogleMapComponent';
import RideRequest from '@/components/RideRequest';
import RideStatus from '@/components/RideStatus';
import UserProfile from '@/components/UserProfile';
import GoogleMapsConfig from '@/components/maps/GoogleMapsConfig';
import { useGoogleMapsApiKey } from '@/hooks/useGoogleMapsApiKey';
import { toast } from 'sonner';

type AppView = 'map' | 'profile';
type RideState = 'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [rideState, setRideState] = useState<RideState>('idle');
  const { apiKey, isConfigured, isLoading, updateApiKey } = useGoogleMapsApiKey();
  
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
      eta: '3 min'
    },
    {
      id: '2',
      lat: -23.5515,
      lng: -46.6343,
      name: 'Ana Costa',
      rating: 4.7,
      eta: '5 min'
    },
    {
      id: '3',
      lat: -23.5495,
      lng: -46.6323,
      name: 'Carlos Lima',
      rating: 4.8,
      eta: '7 min'
    }
  ];

  const [currentDriver, setCurrentDriver] = useState(mockDrivers[0]);

  // Welcome toast effect
  useEffect(() => {
    if (!isLoading && isConfigured) {
      const timer = setTimeout(() => {
        toast.success('Bem-vindo ao Viaja+! 🚗', {
          description: 'Sua solução de mobilidade urbana rápida e confiável.'
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConfigured, isLoading]);

  const handleApiKeyUpdate = (newKey: string) => {
    updateApiKey(newKey);
  };

  const handleRequestRide = (vehicleType: string, pickup: string, destination: string) => {
    if (!isConfigured) {
      toast.error('Configure sua chave da API do Google Maps primeiro', {
        description: 'É necessário configurar a API do Google Maps para solicitar corridas'
      });
      return;
    }
    
    // Show login prompt instead of processing ride
    toast.info('Faça login para solicitar uma corrida', {
      description: 'Você precisa estar logado para usar nossos serviços'
    });
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
        {/* Google Maps API Configuration - mostrar apenas se não configurada */}
        {!isConfigured && <GoogleMapsConfig onApiKeySet={handleApiKeyUpdate} />}

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

        {/* Map View - only show if API is configured */}
        {isConfigured ? (
          <GoogleMapComponent
            center={{ lat: -23.5505, lng: -46.6333 }}
            zoom={15}
            markers={mockDrivers.map(driver => ({
              lat: driver.lat,
              lng: driver.lng,
              title: `${driver.name} - ⭐ ${driver.rating}`,
              icon: undefined
            }))}
            showDirections={rideState !== 'idle'}
            origin={rideState !== 'idle' ? { lat: -23.5505, lng: -46.6333 } : undefined}
            destination={rideState !== 'idle' ? { lat: -23.5525, lng: -46.6353 } : undefined}
          />
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
            <div className="text-center p-8">
              <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Mapa será exibido aqui
              </h3>
              <p className="text-gray-500">
                Configure sua chave da API do Google Maps acima para ver o mapa interativo
              </p>
            </div>
          </div>
        )}

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
                vehicle: 'Honda Civic Branco',
                plate: 'ABC-1234',
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
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viaja-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Viaja+...</p>
        </div>
      </div>
    );
  }

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
