
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Calendar, Filter, Download, Clock, User, Search, RefreshCw, Eye, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import UserHeader from '@/components/user/UserHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRideHistory } from '@/hooks/useRideHistory';
import { RideHistoryFilters, RideHistoryItem } from '@/types/rideHistory';
import RideHistoryCard from '@/components/ride-history/RideHistoryCard';
import RideHistoryFiltersComponent from '@/components/ride-history/RideHistoryFilters';
import RideHistoryStatsComponent from '@/components/ride-history/RideHistoryStats';

const RideHistory = () => {
  const { userProfile } = useUserProfile();
  const { rides, loading, fetchRideHistory, filterRides, getStats, cancelRide, rateService } = useRideHistory();
  
  const [filters, setFilters] = useState<RideHistoryFilters>({
    search: '',
    status: 'all',
    transportType: 'all'
  });
  
  const [selectedRide, setSelectedRide] = useState<RideHistoryItem | null>(null);

  const filteredRides = filterRides(rides, filters);
  const stats = getStats(rides);

  const handleFiltersChange = (newFilters: RideHistoryFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      transportType: 'all'
    });
  };

  const handleViewDetails = (ride: RideHistoryItem) => {
    setSelectedRide(ride);
  };

  const handleCancelRide = async (rideId: string) => {
    const success = await cancelRide(rideId, 'Cancelado pelo usuário');
    if (success) {
      // Atualizar dados se necessário
    }
  };

  const handleRateService = async (rideId: string, rating: number) => {
    const success = await rateService(rideId, rating);
    if (success) {
      // Fechar modal se estiver aberto
      setSelectedRide(null);
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

          {/* Statistics */}
          <RideHistoryStatsComponent stats={stats} />

          {/* Filters */}
          <RideHistoryFiltersComponent 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          {/* Ride Cards */}
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
                      {filters.search || filters.status !== 'all' || filters.transportType !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Suas viagens aparecerão aqui quando você começar a usar o serviço'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredRides.map((ride) => (
                <RideHistoryCard
                  key={ride.id}
                  ride={ride}
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancelRide}
                  onRate={handleRateService}
                />
              ))
            )}
          </div>

          {/* Ride Details Modal */}
          {selectedRide && (
            <Dialog open={!!selectedRide} onOpenChange={() => setSelectedRide(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes da Viagem</DialogTitle>
                  <DialogDescription>
                    Informações completas sobre sua viagem
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Route */}
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

                  {/* Trip Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedRide.scheduled_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge variant="outline">{selectedRide.status}</Badge>
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

                  {/* Ratings */}
                  {selectedRide.status === 'completed' && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Avaliação do Serviço</h4>
                      <div className="flex items-center space-x-2">
                        {selectedRide.service_rating ? (
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < selectedRide.service_rating! 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              ({selectedRide.service_rating})
                            </span>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateService(selectedRide.id, star)}
                                className="text-lg hover:text-yellow-500 transition-colors"
                                title={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                              >
                                ⭐
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedRide.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Observações</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedRide.notes}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Service Info */}
          <Card className="bg-gradient-to-r from-viaja-blue/5 to-viaja-blue/10 border-viaja-blue/20">
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
