import React, { useState } from 'react';
import { Car, MapPin, DollarSign, Clock, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import DriverHeader from '@/components/driver/DriverHeader';
import MapView from '@/components/MapView';
import RideRequestModal from '@/components/driver/RideRequestModal';
import { useDriverData } from '@/hooks/useDriverData';
import { useRideNotifications } from '@/hooks/useRideNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DriverDashboard = () => {
  const { driverInfo, stats, recentRides, loading, toggleOnlineStatus } = useDriverData();
  const { pendingRequests, acceptRide, rejectRide } = useRideNotifications(
    driverInfo?.id || null, 
    true // isDriver = true
  );
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleToggleOnline = (checked: boolean) => {
    toggleOnlineStatus(checked);
  };

  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viaja-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do motorista...</p>
        </div>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do motorista</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driver={{
        name: driverInfo.name,
        email: driverInfo.email,
        rating: driverInfo.rating,
        totalRides: driverInfo.totalRides,
        memberSince: '2022',
        vehicle: `${driverInfo.vehicle.model} ${driverInfo.vehicle.year || ''}`,
        plate: driverInfo.vehicle.plate
      }} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Online Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`h-4 w-4 rounded-full ${driverInfo.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <h3 className="font-semibold">
                        {driverInfo.isAvailable ? 'Você está ONLINE' : 'Você está OFFLINE'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {driverInfo.isAvailable ? 'Recebendo solicitações de corrida' : 'Ative para receber solicitações'}
                      </p>
                    </div>
                  </div>
                  
                  <Switch
                    checked={driverInfo.isAvailable}
                    onCheckedChange={handleToggleOnline}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Solicitações Pendentes */}
            {pendingRequests.length > 0 && (
              <Card className="border-viaja-green bg-gradient-to-r from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-viaja-green" />
                    <span>Solicitações de Corrida ({pendingRequests.length})</span>
                    <Badge variant="secondary" className="animate-pulse">Novo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div 
                      key={request.id}
                      className="p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleRequestClick(request)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{request.patientName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {request.originAddress.length > 40 
                              ? `${request.originAddress.substring(0, 40)}...` 
                              : request.originAddress}
                          </p>
                          <p className="text-xs text-gray-600">
                            → {request.destinationAddress.length > 40 
                              ? `${request.destinationAddress.substring(0, 40)}...` 
                              : request.destinationAddress}
                          </p>
                        </div>
                        {request.price && (
                          <Badge variant="secondary" className="ml-2">
                            R$ {request.price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      E mais {pendingRequests.length - 3} solicitações...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <MapView 
              drivers={[{
                id: driverInfo.id,
                lat: -21.7641,
                lng: -43.3493,
                name: driverInfo.name,
                rating: driverInfo.rating,
                eta: '0 min'
              }]}
              userLocation={{ lat: -21.7641, lng: -43.3493 }}
            />

            {/* Current Ride Status */}
            {driverInfo.isAvailable && pendingRequests.length === 0 && (
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
                    R$ {stats.todayEarnings.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-viaja-blue" />
                    <span className="text-gray-600">Corridas</span>
                  </div>
                  <Badge variant="secondary">{stats.todayRides}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-600">Avaliação</span>
                  </div>
                  <span className="font-semibold">{stats.rating.toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-viaja-orange" />
                    <span className="text-gray-600">Total de Corridas</span>
                  </div>
                  <span className="font-semibold">{stats.totalRides}</span>
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
                  <div className="font-semibold">
                    {driverInfo.vehicle.model} {driverInfo.vehicle.year}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Placa:</span>
                  <div className="font-semibold">{driverInfo.vehicle.plate}</div>
                </div>
                {driverInfo.vehicle.color && (
                  <div>
                    <span className="text-gray-600">Cor:</span>
                    <div className="font-semibold">{driverInfo.vehicle.color}</div>
                  </div>
                )}
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
                {recentRides.length === 0 ? (
                  <div className="text-center py-4">
                    <Car className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Suas corridas aparecerão aqui após a primeira viagem
                    </p>
                  </div>
                ) : (
                  recentRides.slice(0, 5).map((ride) => (
                    <div key={ride.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-viaja-blue" />
                        <div>
                          <div className="font-medium text-sm">{ride.patientName}</div>
                          <div className="text-xs text-gray-600">
                            {format(new Date(ride.completedAt), 'dd/MM HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-sm text-viaja-green">
                          +R$ {ride.price.toFixed(2)}
                        </div>
                        {ride.patientRating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs ml-1">{ride.patientRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Solicitação */}
      <RideRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        request={selectedRequest}
        onAccept={acceptRide}
        onReject={rejectRide}
      />
    </div>
  );
};

export default DriverDashboard;
