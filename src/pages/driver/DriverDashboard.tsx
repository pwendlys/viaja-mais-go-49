
import React, { useState } from 'react';
import { Car, MapPin, DollarSign, Clock, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import DriverHeader from '@/components/driver/DriverHeader';
import MapView from '@/components/MapView';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState<any>(null);

  const driverData = {
    name: 'João Santos',
    email: 'joao.santos@email.com',
    rating: 4.9,
    totalRides: 324,
    memberSince: '2022',
    vehicle: 'Honda Civic 2020',
    plate: 'ABC-1234'
  };

  const todayStats = {
    earnings: 156.80,
    rides: 8,
    hours: 6.5,
    rating: 4.9
  };

  const recentRides = [
    {
      id: 1,
      passenger: 'Maria Silva',
      from: 'Shopping Center',
      to: 'Centro da Cidade',
      time: '14:30',
      earning: 12.50,
      rating: 5
    },
    {
      id: 2,
      passenger: 'Carlos Oliveira',
      from: 'Aeroporto',
      to: 'Hotel Plaza',
      time: '13:15',
      earning: 28.90,
      rating: 5
    }
  ];

  const handleToggleOnline = (checked: boolean) => {
    setIsOnline(checked);
    if (checked) {
      toast.success('Você está online! Aguardando solicitações...');
    } else {
      toast.info('Você está offline');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driver={driverData} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Online Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`h-4 w-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <h3 className="font-semibold">
                        {isOnline ? 'Você está ONLINE' : 'Você está OFFLINE'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isOnline ? 'Recebendo solicitações de corrida' : 'Ative para receber solicitações'}
                      </p>
                    </div>
                  </div>
                  
                  <Switch
                    checked={isOnline}
                    onCheckedChange={handleToggleOnline}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <MapView 
              drivers={[{
                id: '1',
                lat: -23.5505,
                lng: -46.6333,
                name: driverData.name,
                rating: driverData.rating,
                eta: '0 min'
              }]}
              userLocation={{ lat: -23.5505, lng: -46.6333 }}
            />

            {/* Current Ride Status */}
            {isOnline && !currentRide && (
              <Card className="border-viaja-green bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="pt-6 text-center">
                  <Car className="h-12 w-12 mx-auto mb-4 text-viaja-green" />
                  <h3 className="font-semibold text-lg mb-2">Aguardando solicitações</h3>
                  <p className="text-gray-600">
                    Você está online e disponível para receber corridas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Hoje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-viaja-green" />
                    <span className="text-gray-600">Ganhos</span>
                  </div>
                  <span className="font-bold text-lg text-viaja-green">
                    R$ {todayStats.earnings.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-viaja-blue" />
                    <span className="text-gray-600">Corridas</span>
                  </div>
                  <Badge variant="secondary">{todayStats.rides}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-viaja-orange" />
                    <span className="text-gray-600">Horas Online</span>
                  </div>
                  <span className="font-semibold">{todayStats.hours}h</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-600">Avaliação</span>
                  </div>
                  <span className="font-semibold">{todayStats.rating}</span>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle>Meu Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-600">Modelo:</span>
                  <div className="font-semibold">{driverData.vehicle}</div>
                </div>
                <div>
                  <span className="text-gray-600">Placa:</span>
                  <div className="font-semibold">{driverData.plate}</div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Gerenciar Veículo
                </Button>
              </CardContent>
            </Card>

            {/* Recent Rides */}
            <Card>
              <CardHeader>
                <CardTitle>Corridas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRides.map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-viaja-blue" />
                      <div>
                        <div className="font-medium text-sm">{ride.passenger}</div>
                        <div className="text-xs text-gray-600">{ride.time}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-sm text-viaja-green">
                        +R$ {ride.earning.toFixed(2)}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">{ride.rating}</span>
                      </div>
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

export default DriverDashboard;
