
import React, { useState } from 'react';
import { MapPin, Star, Calendar, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import UserHeader from '@/components/user/UserHeader';

const RideHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const userData = {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    rating: 4.8,
    totalTrips: 47,
    memberSince: '2023'
  };

  const rides = [
    {
      id: 1,
      from: 'Shopping Center Iguatemi',
      to: 'Centro da Cidade',
      date: '2024-01-15',
      time: '14:30',
      price: 12.50,
      status: 'completed',
      driver: 'João Santos',
      driverRating: 4.9,
      vehicleModel: 'Honda Civic',
      duration: '25 min',
      distance: '8.5 km',
      userRating: 5
    },
    {
      id: 2,
      from: 'Aeroporto Internacional',
      to: 'Hotel Central Plaza',
      date: '2024-01-10',
      time: '09:15',
      price: 28.90,
      status: 'completed',
      driver: 'Ana Costa',
      driverRating: 4.7,
      vehicleModel: 'Toyota Corolla',
      duration: '45 min',
      distance: '22.3 km',
      userRating: 4
    },
    {
      id: 3,
      from: 'Universidade Federal',
      to: 'Residencial Vila Nova',
      date: '2024-01-08',
      time: '18:45',
      price: 15.20,
      status: 'completed',
      driver: 'Carlos Lima',
      driverRating: 4.8,
      vehicleModel: 'Nissan Versa',
      duration: '30 min',
      distance: '12.1 km',
      userRating: 5
    },
    {
      id: 4,
      from: 'Shopping Morumbi',
      to: 'Estação Metro Vila Madalena',
      date: '2024-01-05',
      time: '16:20',
      price: 18.75,
      status: 'cancelled',
      driver: 'Pedro Oliveira',
      driverRating: 4.6,
      vehicleModel: 'Hyundai HB20',
      duration: '-',
      distance: '-',
      userRating: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Histórico de Viagens</h1>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por origem ou destino..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rides List */}
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-viaja-blue" />
                        <span className="font-medium">{ride.from}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-700">{ride.to}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg text-viaja-blue">
                        R$ {ride.price.toFixed(2)}
                      </div>
                      {getStatusBadge(ride.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-medium">Data</div>
                      <div>{ride.date} às {ride.time}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Motorista</div>
                      <div className="flex items-center space-x-1">
                        <span>{ride.driver}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{ride.driverRating}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Veículo</div>
                      <div>{ride.vehicleModel}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Duração/Distância</div>
                      <div>{ride.duration} • {ride.distance}</div>
                    </div>
                  </div>

                  {ride.status === 'completed' && ride.userRating && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sua avaliação:</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: ride.userRating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRides.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma viagem encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideHistory;
