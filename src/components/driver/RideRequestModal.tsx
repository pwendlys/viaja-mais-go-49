
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, DollarSign, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RideRequest {
  id: string;
  patientId: string;
  patientName: string;
  originAddress: string;
  destinationAddress: string;
  appointmentDate?: string;
  distance?: number;
  price?: number;
  medicalNotes?: string;
}

interface RideRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RideRequest | null;
  onAccept: (rideId: string) => void;
  onReject: (rideId: string) => void;
}

const RideRequestModal = ({ isOpen, onClose, request, onAccept, onReject }: RideRequestModalProps) => {
  if (!request) return null;

  const handleAccept = () => {
    onAccept(request.id);
    onClose();
  };

  const handleReject = () => {
    onReject(request.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-viaja-green rounded-full animate-pulse"></div>
            <span>Nova Solicitação de Corrida</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações do Paciente */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{request.patientName}</h3>
                <p className="text-sm text-gray-600">Paciente</p>
              </div>
            </CardContent>
          </Card>

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

          {/* Detalhes da Corrida */}
          <div className="grid grid-cols-2 gap-4">
            {request.distance && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-viaja-blue" />
                <div>
                  <p className="text-xs text-gray-600">Distância</p>
                  <p className="font-semibold">{request.distance.toFixed(1)} km</p>
                </div>
              </div>
            )}

            {request.price && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-viaja-green" />
                <div>
                  <p className="text-xs text-gray-600">Valor</p>
                  <p className="font-semibold">R$ {request.price.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Data do Agendamento */}
          {request.appointmentDate && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-viaja-blue" />
              <div>
                <p className="text-xs text-gray-600">Agendado para</p>
                <p className="font-semibold text-sm">
                  {format(new Date(request.appointmentDate), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}

          {/* Observações Médicas */}
          {request.medicalNotes && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-yellow-600 mt-1" />
                <div>
                  <p className="text-xs text-yellow-700 font-medium">Observações Médicas</p>
                  <p className="text-sm text-yellow-800">{request.medicalNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReject}
              className="flex-1"
            >
              Recusar
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 gradient-viaja text-white"
            >
              Aceitar Corrida
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RideRequestModal;
