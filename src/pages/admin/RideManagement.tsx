
import React, { useState } from 'react';
import { MapPin, Search, Filter, MoreVertical, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminHeader from '@/components/admin/AdminHeader';
import { toast } from 'sonner';

const RideManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const adminData = {
    name: 'Ana Administradora',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const [rides, setRides] = useState([
    {
      id: 'VJ001',
      passenger: 'Maria Silva',
      driver: 'João Santos',
      from: 'Shopping Center',
      to: 'Centro da Cidade',
      status: 'Concluída',
      fare: 25.80,
      distance: '12.5 km',
      duration: '28 min',
      rating: 5,
      date: '2024-01-15 14:30',
      paymentMethod: 'Cartão'
    },
    {
      id: 'VJ002',
      passenger: 'Carlos Oliveira',
      driver: 'Roberto Silva',
      from: 'Aeroporto Internacional',
      to: 'Hotel Plaza',
      status: 'Em Andamento',
      fare: 45.20,
      distance: '23.1 km',
      duration: '35 min',
      rating: null,
      date: '2024-01-15 15:45',
      paymentMethod: 'PIX'
    },
    {
      id: 'VJ003',
      passenger: 'Ana Costa',
      driver: 'Carlos Mendes',
      from: 'Universidade',
      to: 'Residencial Vila Nova',
      status: 'Cancelada',
      fare: 0,
      distance: '8.2 km',
      duration: '0 min',
      rating: null,
      date: '2024-01-15 13:15',
      paymentMethod: 'Dinheiro'
    },
    {
      id: 'VJ004',
      passenger: 'Pedro Santos',
      driver: 'João Santos',
      from: 'Centro Médico',
      to: 'Residência',
      status: 'Disputada',
      fare: 18.50,
      distance: '7.8 km',
      duration: '22 min',
      rating: 1,
      date: '2024-01-15 11:20',
      paymentMethod: 'Cartão'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800';
      case 'Disputada':
        return 'bg-red-100 text-red-800';
      case 'Aguardando':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveDispute = (rideId: string) => {
    setRides(rides.map(ride => 
      ride.id === rideId ? { ...ride, status: 'Concluída' } : ride
    ));
    toast.success('Disputa resolvida com sucesso');
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.passenger.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Corridas</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar corridas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Disputada">Disputada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Corridas</p>
                  <p className="text-2xl font-bold text-viaja-blue">{rides.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-viaja-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Corridas Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rides.filter(r => r.status === 'Concluída').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {rides.filter(r => r.status === 'Em Andamento').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disputas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rides.filter(r => r.status === 'Disputada').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rides Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Corridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">ID</th>
                    <th className="text-left py-3">Passageiro</th>
                    <th className="text-left py-3">Motorista</th>
                    <th className="text-left py-3">Trajeto</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Valor</th>
                    <th className="text-left py-3">Distância/Tempo</th>
                    <th className="text-left py-3">Avaliação</th>
                    <th className="text-left py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRides.map((ride) => (
                    <tr key={ride.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-medium">{ride.id}</td>
                      <td className="py-4">{ride.passenger}</td>
                      <td className="py-4">{ride.driver}</td>
                      <td className="py-4">
                        <div className="text-sm">
                          <div className="font-medium">{ride.from}</div>
                          <div className="text-gray-500">↓ {ride.to}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(ride.status)}>
                          {ride.status}
                        </Badge>
                      </td>
                      <td className="py-4 font-medium text-viaja-green">
                        {ride.fare > 0 ? `R$ ${ride.fare.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-4 text-sm">
                        <div>{ride.distance}</div>
                        <div className="text-gray-500">{ride.duration}</div>
                      </td>
                      <td className="py-4">
                        {ride.rating ? (
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">⭐</span>
                            {ride.rating}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {ride.status === 'Disputada' && (
                              <DropdownMenuItem onClick={() => handleResolveDispute(ride.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver Disputa
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RideManagement;
