
import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Clock, User, History, Settings, Calendar, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import RideStatus from '@/components/RideStatus';
import UserHeader from '@/components/user/UserHeader';
import MapView from '@/components/MapView';
import { useUserProfile } from '@/hooks/useUserProfile';
import TabbedRideRequest from '@/components/TabbedRideRequest';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { useLoadingState } from '@/hooks/useLoadingState';
import { apiMiddleware } from '@/utils/apiMiddleware';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

type RideState = 'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';

const UserDashboard = () => {
  const [rideState, setRideState] = useState<RideState>('idle');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [routeOrigin, setRouteOrigin] = useState<{lat: number, lng: number} | null>(null);
  const [routeDestination, setRouteDestination] = useState<{lat: number, lng: number} | null>(null);
  const [apiHealth, setApiHealth] = useState<boolean>(true);

  // Hooks
  const { userProfile, loading, error, refetch: refreshProfile } = useUserProfile();
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { isLoading, withLoading } = useLoadingState(['requestRide', 'scheduleRide']);

  // Mock drivers for demonstration
  const mockDrivers = [
    {
      id: '1',
      name: 'João Silva',
      lat: -21.7608,
      lng: -43.3667,
      rating: 4.8,
      eta: '5 min'
    },
    {
      id: '2',
      name: 'Ana Santos',
      lat: -21.7500,
      lng: -43.3600,
      rating: 4.9,
      eta: '8 min'
    }
  ];

  // API health monitoring
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await apiMiddleware.healthCheck();
      setApiHealth(isHealthy);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleRequestRide = useCallback(async (vehicleType: string, pickup: string, destination: string) => {
    try {
      await withLoading('requestRide', async () => {
        setRideState('searching');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        handleSuccess(`Solicitando ${vehicleType} de ${pickup} para ${destination}`);
        
        // Reset after demo
        setTimeout(() => {
          setRideState('idle');
        }, 3000);
      });
    } catch (error) {
      handleError(error, 'solicitação de corrida');
      setRideState('idle');
    }
  }, [withLoading, handleSuccess, handleError]);

  const handleScheduleRide = useCallback(async (data: {
    vehicleType: string;
    pickup: string;
    destination: string;
    appointmentDate: Date;
    appointmentTime: string;
    notes?: string;
  }) => {
    try {
      await withLoading('scheduleRide', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Agendamento:', data);
        handleSuccess(`Transporte agendado para ${data.appointmentDate.toLocaleDateString('pt-BR')} às ${data.appointmentTime}`);
      });
    } catch (error) {
      handleError(error, 'agendamento de transporte');
    }
  }, [withLoading, handleSuccess, handleError]);

  const handleCancelRide = useCallback(() => {
    setRideState('idle');
    handleSuccess('Corrida cancelada');
  }, [handleSuccess]);

  const handleRateRide = useCallback((rating: number) => {
    setRideState('idle');
    handleSuccess(`Avaliação enviada: ${rating} estrelas`);
  }, [handleSuccess]);

  const handleRouteChange = useCallback((origin: Location | null, destination: Location | null) => {
    setRouteOrigin(origin);
    setRouteDestination(destination);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-viaja-blue" />
          <span>Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Erro ao carregar dados</p>
            <p className="text-sm">{error || 'Dados do usuário não encontrados'}</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={refreshProfile}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Tentar Novamente'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare user data for header
  const userData = {
    name: userProfile.profile.full_name,
    email: '', // Email não está sendo retornado da API
    rating: userProfile.stats.rating || 0,
    totalTrips: userProfile.stats.totalTrips,
    memberSince: new Date(userProfile.profile.created_at).getFullYear().toString()
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      {/* API Health Warning */}
      {!apiHealth && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Problemas de conectividade detectados. Algumas funcionalidades podem estar limitadas.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Message */}
            <Card className="bg-gradient-viaja-subtle border-viaja-blue/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-viaja-blue mb-2">
                    Bem-vindo ao Transporte Municipal de Saúde
                  </h2>
                  <p className="text-gray-700">
                    Solicite transporte gratuito para suas consultas e exames médicos.
                    O serviço é oferecido pela Prefeitura de Juiz de Fora.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-viaja-blue" />
                  <span>Mapa de Transporte</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Acompanhe em tempo real a localização do seu transporte
                </p>
              </CardHeader>
              <CardContent>
                <MapView 
                  drivers={mockDrivers}
                  userLocation={{ lat: -21.7554, lng: -43.3636 }}
                  origin={routeOrigin}
                  destination={routeDestination}
                />
              </CardContent>
            </Card>

            {/* Ride Request/Status Section */}
            <div id="ride-request-section" className="flex justify-center">
              {rideState === 'idle' ? (
                <TabbedRideRequest 
                  onRequestRide={handleRequestRide}
                  onScheduleRide={handleScheduleRide}
                  prefilledDestination={selectedDestination}
                  onRouteChange={handleRouteChange}
                />
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Meu Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userProfile.stats.hasRating ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avaliação</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold">{userProfile.stats.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avaliação</span>
                    <span className="text-gray-400 text-sm">Nenhuma avaliação ainda</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Transportes</span>
                  {userProfile.stats.totalTrips > 0 ? (
                    <Badge variant="secondary">{userProfile.stats.totalTrips}</Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">Nenhum transporte ainda</span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuário desde</span>
                  <span className="font-semibold">{userData.memberSince}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/user/history">
                  <Button variant="outline" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    Histórico de Transportes
                  </Button>
                </Link>
                <Link to="/user/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações Pessoais
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const scheduleSection = document.getElementById('ride-request-section');
                    scheduleSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Transporte
                </Button>
              </CardContent>
            </Card>

            {/* Recent Rides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Transportes Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {userProfile.stats.totalTrips > 0 
                      ? 'Carregando transportes recentes...' 
                      : 'Nenhum transporte recente'
                    }
                  </p>
                  <p className="text-gray-400 text-xs">
                    {userProfile.stats.totalTrips === 0 
                      ? 'Seus transportes aparecerão aqui' 
                      : ''
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
