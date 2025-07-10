
import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, DollarSign, Navigation, AlertCircle, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRideNotifications } from '@/hooks/useRideNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RealTimeRequestPanelProps {
  driverId: string;
  isOnline: boolean;
  currentLocation?: { lat: number; lng: number };
}

const RealTimeRequestPanel = ({ driverId, isOnline, currentLocation }: RealTimeRequestPanelProps) => {
  const { pendingRequests, acceptRide, rejectRide, isConnected } = useRideNotifications(driverId, 'driver');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Som de notificação para novas solicitações
  useEffect(() => {
    if (pendingRequests.length > 0 && audioEnabled) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // Ignorar erro se o usuário não permitiu autoplay
      });
    }
  }, [pendingRequests.length, audioEnabled]);

  const calculateDistance = (request: any) => {
    if (!currentLocation) return 0;
    
    const R = 6371; // Raio da Terra em km
    const dLat = (request.originLat - currentLocation.lat) * Math.PI / 180;
    const dLng = (request.originLng - currentLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(request.originLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateETA = (distance: number) => {
    // Assumindo velocidade média de 30 km/h na cidade
    return Math.round((distance / 30) * 60); // em minutos
  };

  const handleAcceptRide = async (rideId: string) => {
    const success = await acceptRide(rideId);
    if (success) {
      setSelectedRequest(null);
    }
  };

  const handleRejectRide = async (rideId: string) => {
    await rejectRide(rideId);
    setSelectedRequest(null);
  };

  if (!isOnline) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Você está offline. Ative o status online para receber solicitações.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status de Conexão */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Conectado - Recebendo solicitações' : 'Desconectado - Tentando reconectar...'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={audioEnabled ? 'text-blue-600' : 'text-gray-400'}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Navigation className="h-12 w-12 mx-auto mb-4 text-viaja-blue" />
              <p className="font-medium">Aguardando solicitações...</p>
              <p className="text-sm">Você está online e disponível para corridas</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        pendingRequests.map((request) => {
          const distance = calculateDistance(request);
          const eta = calculateETA(distance);
          
          return (
            <Card key={request.id} className="border-viaja-green bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-viaja-green animate-pulse" />
                    <span>Nova Solicitação</span>
                  </CardTitle>
                  <Badge variant="secondary" className="animate-pulse">
                    {format(new Date(request.createdAt), 'HH:mm', { locale: ptBR })}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações do Paciente */}
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="font-semibold text-lg">{request.patientName}</h4>
                  <p className="text-sm text-gray-600">Paciente</p>
                </div>

                {/* Trajeto */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Origem</p>
                      <p className="font-medium text-sm">{request.originAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Destino</p>
                      <p className="font-medium text-sm">{request.destinationAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 bg-white p-3 rounded-lg">
                  <div className="text-center">
                    <MapPin className="h-4 w-4 text-viaja-blue mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Distância até você</p>
                    <p className="font-semibold">{distance.toFixed(1)} km</p>
                  </div>
                  
                  <div className="text-center">
                    <Clock className="h-4 w-4 text-viaja-orange mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Tempo estimado</p>
                    <p className="font-semibold">{eta} min</p>
                  </div>
                  
                  <div className="text-center">
                    <DollarSign className="h-4 w-4 text-viaja-green mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Valor</p>
                    <p className="font-semibold">R$ {request.price?.toFixed(2) || '0,00'}</p>
                  </div>
                </div>

                {/* Observações Médicas */}
                {request.medicalNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Observações médicas:</strong> {request.medicalNotes}
                    </p>
                  </div>
                )}

                {/* Tipo de Consulta */}
                {request.appointmentType && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tipo de consulta:</strong> {request.appointmentType}
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleRejectRide(request.id)}
                    className="flex-1"
                  >
                    Recusar
                  </Button>
                  <Button
                    onClick={() => handleAcceptRide(request.id)}
                    className="flex-1 gradient-viaja text-white"
                  >
                    Aceitar Corrida
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default RealTimeRequestPanel;
