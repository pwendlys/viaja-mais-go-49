
import React, { useState } from 'react';
import { MapPin, Clock, CreditCard, Star, User, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import MapView from '@/components/MapView';
import RideRequest from '@/components/RideRequest';
import RideStatus from '@/components/RideStatus';
import UserHeader from '@/components/user/UserHeader';

const UserDashboard = () => {
  const [rideState, setRideState] = useState<'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed'>('idle');

  // User data - will come from database
  const userData = {
    name: 'Usuário',
    email: 'usuario@email.com',
    rating: 0,
    totalTrips: 0,
    memberSince: '2024'
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
            {/* Map Placeholder */}
            <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-blue-300 p-6">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <MapPin className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Mapa de Corridas
                </h3>
                <p className="text-gray-500">
                  Visualização em tempo real das corridas será exibida aqui
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
            {/* Quick Stats */}
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
                    <Star className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Sem avaliações</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Viagens</span>
                  <Badge variant="secondary">{userData.totalTrips}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membro desde</span>
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
                    Histórico de Viagens
                  </Button>
                </Link>
                <Link to="/user/payment">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Métodos de Pagamento
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Empty Recent Rides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Viagens Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhuma viagem realizada</p>
                  <p className="text-gray-400 text-xs">Suas viagens aparecerão aqui</p>
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
