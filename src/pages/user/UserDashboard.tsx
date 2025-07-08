
import React, { useState } from 'react';
import { MapPin, Clock, User, History, Settings, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import RideRequest from '@/components/RideRequest';
import RideStatus from '@/components/RideStatus';
import UserHeader from '@/components/user/UserHeader';

const UserDashboard = () => {
  const [rideState, setRideState] = useState<'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed'>('idle');

  // User data - will come from database
  const userData = {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    rating: 4.8,
    totalTrips: 12,
    memberSince: '2023'
  };

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

            {/* Map Placeholder */}
            <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-blue-300 p-6">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <MapPin className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Mapa de Transporte
                </h3>
                <p className="text-gray-500">
                  Acompanhe em tempo real a localização do seu transporte
                </p>
              </div>
            </div>

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
                <div className="flex justify-between">
                  <span className="text-gray-600">Avaliação</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{userData.rating}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transportes</span>
                  <Badge variant="secondary">{userData.totalTrips}</Badge>
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
                  <span>Serviços de Saúde</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Principais destinos:</p>
                  <ul className="space-y-1">
                    <li>• Hospital Municipal</li>
                    <li>• UPA Centro</li>
                    <li>• Policlínica Central</li>
                    <li>• Centro de Especialidades</li>
                  </ul>
                </div>
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
                  <p className="text-gray-500 text-sm">Nenhum transporte recente</p>
                  <p className="text-gray-400 text-xs">Seus transportes aparecerão aqui</p>
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
