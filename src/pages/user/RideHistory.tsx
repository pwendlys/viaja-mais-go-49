
import React, { useState } from 'react';
import { MapPin, Star, Calendar, Filter, Download, Clock, User } from 'lucide-react';
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
    totalTrips: 12,
    memberSince: '2023'
  };

  // Mock data - will come from database
  const rides = [
    {
      id: 1,
      date: '2024-01-15',
      time: '09:30',
      origin: 'Rua das Flores, 123 - Centro',
      destination: 'Hospital Municipal - Centro',
      category: 'Consulta Médica',
      appointmentType: 'Cardiologia',
      status: 'completed',
      driver: 'João Silva',
      driverRating: 4.8,
      patientRating: 5,
      distance: '3.2 km',
      duration: '15 min'
    },
    {
      id: 2,
      date: '2024-01-10',
      time: '14:00',
      origin: 'Rua das Flores, 123 - Centro',
      destination: 'Policlínica Central - Centro', 
      category: 'Exames',
      appointmentType: 'Exame de Sangue',
      status: 'completed',
      driver: 'Maria Santos',
      driverRating: 4.9,
      patientRating: 4,
      distance: '2.8 km',
      duration: '12 min'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completed': { label: 'Concluída', variant: 'default' as const },
      'cancelled': { label: 'Cancelada', variant: 'destructive' as const },
      'in_progress': { label: 'Em Andamento', variant: 'secondary' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Histórico de Transportes</h1>
            <Button variant="outline" disabled>
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
                    placeholder="Buscar por origem, destino ou tipo de consulta..."
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

          {/* Ride History */}
          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(ride.date).toLocaleDateString('pt-BR')} às {ride.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{ride.category}</Badge>
                          {ride.appointmentType && (
                            <Badge variant="secondary">{ride.appointmentType}</Badge>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(ride.status)}
                    </div>

                    {/* Route */}
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="w-0.5 h-6 bg-gray-300"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-sm font-medium">Origem</p>
                            <p className="text-sm text-gray-600">{ride.origin}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Destino</p>
                            <p className="text-sm text-gray-600">{ride.destination}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Distância</p>
                        <p className="text-sm font-medium">{ride.distance}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Duração</p>
                        <p className="text-sm font-medium">{ride.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Motorista</p>
                        <p className="text-sm font-medium">{ride.driver}</p>
                        <p className="text-xs text-gray-500">{getRatingStars(ride.driverRating)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Sua Avaliação</p>
                        <p className="text-sm font-medium">{getRatingStars(ride.patientRating)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Info */}
          <Card className="bg-gradient-viaja-subtle border-viaja-blue/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-viaja-blue mb-2">🚗 Transporte Municipal Gratuito</h3>
                <p className="text-sm text-gray-700">
                  Todos os transportes são oferecidos gratuitamente pela Prefeitura de Juiz de Fora
                  para facilitar o acesso aos serviços de saúde da população.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RideHistory;
