import React, { useState } from 'react';
import { MapPin, Clock, User, History, Settings, Calendar, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import ImprovedRideRequest from '@/components/ImprovedRideRequest';
import RideStatus from '@/components/RideStatus';
import UserHeader from '@/components/user/UserHeader';
import MapView from '@/components/MapView';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const UserDashboard = () => {
  const [rideState, setRideState] = useState<'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed'>('idle');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [routeOrigin, setRouteOrigin] = useState<{lat: number, lng: number} | null>(null);
  const [routeDestination, setRouteDestination] = useState<{lat: number, lng: number} | null>(null);
  const { userProfile, loading, error } = useUserProfile();

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

  // Principais hospitais de Juiz de Fora
  const healthFacilities = [
    {
      name: 'Hospital Monte Sinai',
      address: 'Av. Barão do Rio Branco, 3596 - Passos, Juiz de Fora - MG',
      type: 'Hospital Privado'
    },
    {
      name: 'Hospital e Maternidade Therezinha de Jesus',
      address: 'Rua Cel. Antônio Augusto de Carvalho, 1 - São Mateus, Juiz de Fora - MG',
      type: 'Hospital Privado'
    },
    {
      name: 'Hospital Regional João Penido (HU-UFJF)',
      address: 'Rua José Lourenço Kelmer, s/n - São Pedro, Juiz de Fora - MG',
      type: 'Hospital Universitário'
    },
    {
      name: 'Hospital Municipal (UPA Leste)',
      address: 'Rua Francisco Valadares, 1000 - Linhares, Juiz de Fora - MG',
      type: 'Hospital Municipal'
    },
    {
      name: 'Hospital Policlínica de Juiz de Fora',
      address: 'Av. Independência, 2500 - Centro, Juiz de Fora - MG',
      type: 'Hospital Privado'
    }
  ];

  const handleRequestRide = (vehicleType: string, pickup: string, destination: string) => {
    setRideState('searching');
    // In real app, this would connect to database
    setTimeout(() => setRideState('idle'), 3000);
  };

  const handleCancelRide = () => {
    setRideState('idle');
  };

  const handleRateRide = (rating: number) => {
    setRideState('idle');
  };

  const handleSelectHealthFacility = (facility: any) => {
    setSelectedDestination(facility.address);
    const rideRequestElement = document.getElementById('ride-request-section');
    if (rideRequestElement) {
      rideRequestElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRouteChange = (origin: Location | null, destination: Location | null) => {
    setRouteOrigin(origin);
    setRouteDestination(destination);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erro ao carregar dados'}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Preparar dados do usuário para o header
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

            <div id="ride-request-section" className="flex justify-center">
              {rideState === 'idle' ? (
                <ImprovedRideRequest 
                  onRequestRide={handleRequestRide} 
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
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Transporte
                </Button>
              </CardContent>
            </Card>

            {/* Health Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Principais Hospitais</span>
                </CardTitle>
                <p className="text-xs text-gray-500">Clique para definir como destino</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {healthFacilities.map((facility, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectHealthFacility(facility)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-viaja-blue hover:bg-gradient-viaja-subtle transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-viaja-blue rounded-full mt-2 group-hover:bg-viaja-orange transition-colors"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm group-hover:text-viaja-blue transition-colors">
                          {facility.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {facility.type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {facility.address}
                        </p>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-400 group-hover:text-viaja-blue transition-colors" />
                    </div>
                  </button>
                ))}
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
