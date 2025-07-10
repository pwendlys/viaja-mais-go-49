
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Calendar, Filter, Download, Clock, User, Search, RefreshCw, Eye, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import UserHeader from '@/components/user/UserHeader';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RideHistoryItem {
  id: string;
  origin_address: string;
  destination_address: string;
  scheduled_date: string;
  actual_departure?: string;
  actual_arrival?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  transport_type: 'tradicional' | 'acessivel';
  fare_amount?: number;
  distance_km?: number;
  duration_minutes?: number;
  driver_rating?: number;
  service_rating?: number;
  notes?: string;
  cancellation_reason?: string;
  vehicle_info?: any;
  created_at: string;
}

const RideHistory = () => {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [filteredRides, setFilteredRides] = useState<RideHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transportFilter, setTransportFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<RideHistoryItem | null>(null);
  const { userProfile } = useUserProfile();

  useEffect(() => {
    fetchRideHistory();
  }, []);

  useEffect(() => {
    filterRides();
  }, [rides, searchTerm, statusFilter, transportFilter]);

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ride_history')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setRides(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de viagens');
    } finally {
      setLoading(false);
    }
  };

  const filterRides = () => {
    let filtered = rides;

    if (searchTerm) {
      filtered = filtered.filter(ride =>
        ride.origin_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.destination_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ride => ride.status === statusFilter);
    }

    if (transportFilter !== 'all') {
      filtered = filtered.filter(ride => ride.transport_type === transportFilter);
    }

    setFilteredRides(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'scheduled': { label: 'Agendado', variant: 'secondary' as const, icon: Clock },
      'confirmed': { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle2 },
      'in_progress': { label: 'Em Andamento', variant: 'default' as const, icon: RefreshCw },
      'completed': { label: 'Concluído', variant: 'default' as const, icon: CheckCircle2 },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: AlertCircle 
    };
    
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getTransportTypeBadge = (type: string) => {
    const typeMap = {
      'tradicional': { label: 'Tradicional', variant: 'outline' as const },
      'acessivel': { label: 'Acessível', variant: 'secondary' as const }
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || { 
      label: type, 
      variant: 'outline' as const 
    };
    
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">Não avaliado</span>;
    return '⭐'.repeat(rating);
  };

  const canCancelRide = (ride: RideHistoryItem) => {
    return ride.status === 'scheduled' || ride.status === 'confirmed';
  };

  const canRescheduleRide = (ride: RideHistoryItem) => {
    return ride.status === 'scheduled';
  };

  const handleCancelRide = async (rideId: string) => {
    try {
      const { error } = await supabase
        .from('ride_history')
        .update({ 
          status: 'cancelled',
          cancellation_reason: 'Cancelado pelo usuário'
        })
        .eq('id', rideId);

      if (error) throw error;
      
      toast.success('Viagem cancelada com sucesso');
      fetchRideHistory();
    } catch (error) {
      console.error('Erro ao cancelar viagem:', error);
      toast.error('Erro ao cancelar viagem');
    }
  };

  const handleRateService = async (rideId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('ride_history')
        .update({ service_rating: rating })
        .eq('id', rideId);

      if (error) throw error;
      
      toast.success('Avaliação enviada com sucesso');
      fetchRideHistory();
    } catch (error) {
      console.error('Erro ao avaliar serviço:', error);
      toast.error('Erro ao enviar avaliação');
    }
  };

  const userData = {
    name: userProfile?.profile.full_name || 'Usuário',
    email: '',
    rating: 4.8,
    totalTrips: rides.length,
    memberSince: userProfile?.profile.created_at 
      ? new Date(userProfile.profile.created_at).getFullYear().toString() 
      : new Date().getFullYear().toString()
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-viaja-blue" />
          <span>Carregando histórico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Histórico de Transportes</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchRideHistory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por origem, destino ou observações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={transportFilter} onValueChange={setTransportFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo de Transporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="tradicional">Tradicional</SelectItem>
                    <SelectItem value="acessivel">Acessível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Viagens */}
          <div className="space-y-4">
            {filteredRides.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      Nenhuma viagem encontrada
                    </h3>
                    <p className="text-gray-400">
                      {searchTerm || statusFilter !== 'all' || transportFilter !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Suas viagens aparecerão aqui quando você começar a usar o serviço'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredRides.map((ride) => (
                <Card key={ride.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(ride.scheduled_date).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(ride.scheduled_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTransportTypeBadge(ride.transport_type)}
                            {ride.notes && (
                              <Badge variant="outline">{ride.notes}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(ride.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRide(ride)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes da Viagem</DialogTitle>
                                <DialogDescription>
                                  Informações completas sobre sua viagem
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRide && (
                                <div className="space-y-4">
                                  {/* Rota */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium">Rota</h4>
                                    <div className="flex items-start space-x-3">
                                      <div className="flex flex-col items-center mt-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div className="w-0.5 h-8 bg-gray-300"></div>
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                      </div>
                                      <div className="flex-1 space-y-3">
                                        <div>
                                          <p className="text-sm font-medium">Origem</p>
                                          <p className="text-sm text-gray-600">{selectedRide.origin_address}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Destino</p>
                                          <p className="text-sm text-gray-600">{selectedRide.destination_address}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Informações da Viagem */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="text-xs text-gray-500">Status</p>
                                      {getStatusBadge(selectedRide.status)}
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Tipo</p>
                                      {getTransportTypeBadge(selectedRide.transport_type)}
                                    </div>
                                    {selectedRide.distance_km && (
                                      <div>
                                        <p className="text-xs text-gray-500">Distância</p>
                                        <p className="text-sm font-medium">{selectedRide.distance_km} km</p>
                                      </div>
                                    )}
                                    {selectedRide.duration_minutes && (
                                      <div>
                                        <p className="text-xs text-gray-500">Duração</p>
                                        <p className="text-sm font-medium">{selectedRide.duration_minutes} min</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Avaliações */}
                                  {selectedRide.status === 'completed' && (
                                    <div className="space-y-3">
                                      <h4 className="font-medium">Avaliações</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">Motorista</p>
                                          <p className="text-sm font-medium">
                                            {getRatingStars(selectedRide.driver_rating)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Serviço</p>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">
                                              {getRatingStars(selectedRide.service_rating)}
                                            </span>
                                            {!selectedRide.service_rating && (
                                              <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <button
                                                    key={star}
                                                    onClick={() => handleRateService(selectedRide.id, star)}
                                                    className="text-lg hover:text-yellow-500 transition-colors"
                                                  >
                                                    ⭐
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Observações */}
                                  {selectedRide.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2">Observações</h4>
                                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                        {selectedRide.notes}
                                      </p>
                                    </div>
                                  )}

                                  {/* Ações */}
                                  <div className="flex justify-end space-x-2">
                                    {canCancelRide(selectedRide) && (
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleCancelRide(selectedRide.id)}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancelar
                                      </Button>
                                    )}
                                    {canRescheduleRide(selectedRide) && (
                                      <Button variant="outline" size="sm" disabled>
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Reagendar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* Rota resumida */}
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
                              <p className="text-sm text-gray-600 truncate">{ride.origin_address}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Destino</p>
                              <p className="text-sm text-gray-600 truncate">{ride.destination_address}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informações resumidas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        {ride.distance_km && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Distância</p>
                            <p className="text-sm font-medium">{ride.distance_km} km</p>
                          </div>
                        )}
                        {ride.duration_minutes && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Duração</p>
                            <p className="text-sm font-medium">{ride.duration_minutes} min</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Valor</p>
                          <p className="text-sm font-medium text-green-600">Gratuito</p>
                        </div>
                        {ride.status === 'completed' && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Avaliação</p>
                            <p className="text-sm font-medium">
                              {getRatingStars(ride.service_rating)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Estatísticas */}
          <Card className="bg-gradient-viaja-subtle border-viaja-blue/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-viaja-blue mb-2">📊 Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-2xl font-bold text-viaja-blue">{rides.length}</p>
                    <p className="text-sm text-gray-600">Total de Viagens</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {rides.filter(r => r.status === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-600">Concluídas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {rides.filter(r => r.status === 'scheduled' || r.status === 'confirmed').length}
                    </p>
                    <p className="text-sm text-gray-600">Agendadas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {rides.filter(r => r.status === 'cancelled').length}
                    </p>
                    <p className="text-sm text-gray-600">Canceladas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
