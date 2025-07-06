
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
    }
  ];

  const recentRides = [
    {
      id: 1,
      from: 'Shopping Center',
      to: 'Centro da Cidade',
      date: '2024-01-15',
      price: 'R$ 12,50',
      status: 'completed'
    },
    {
      id: 2,
      from: 'Aeroporto',
      to: 'Hotel Central',
      date: '2024-01-10',
      price: 'R$ 28,90',
      status: 'completed'
    }
  ];

  const handleRequestRide = (vehicleType: string, pickup: string, destination: string) => {
    setRideState('searching');
    // Mock ride flow simulation
    setTimeout(() => setRideState('driver-assigned'), 3000);
    setTimeout(() => setRideState('driver-arriving'), 6000);
    setTimeout(() => setRideState('in-transit'), 12000);
    setTimeout(() => setRideState('completed'), 20000);
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
            {/* Map and Ride Interface */}
            <MapView 
              drivers={mockDrivers}
              userLocation={{ lat: -23.5505, lng: -46.6333 }}
              destination={rideState !== 'idle' ? { lat: -23.5525, lng: -46.6353 } : undefined}
            />

            <div className="flex justify-center">
              {rideState === 'idle' ? (
                <RideRequest onRequestRide={handleRequestRide} />
              ) : (
                <RideStatus
                  status={rideState}
                  driver={rideState !== 'searching' ? {
                    name: 'João Santos',
                    rating: 4.9,
                    vehicle: 'Honda Civic Branco',
                    plate: 'ABC-1234',
                    eta: '3 min'
                  } : undefined}
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
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{userData.rating}</span>
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

            {/* Recent Rides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Viagens Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRides.map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-viaja-blue" />
                      <div>
                        <div className="font-medium text-sm">{ride.from}</div>
                        <div className="text-xs text-gray-600">→ {ride.to}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{ride.price}</div>
                      <div className="text-xs text-gray-600">{ride.date}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
