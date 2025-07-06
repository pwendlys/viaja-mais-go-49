
import React from 'react';
import { Phone, MessageCircle, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface RideStatusProps {
  status: 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';
  driver?: {
    name: string;
    rating: number;
    vehicle: string;
    plate: string;
    eta: string;
  };
  onCancel: () => void;
  onRate?: (rating: number) => void;
}

const RideStatus = ({ status, driver, onCancel, onRate }: RideStatusProps) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'searching':
        return 'Procurando motorista...';
      case 'driver-assigned':
        return 'Motorista encontrado!';
      case 'driver-arriving':
        return 'Motorista a caminho';
      case 'in-transit':
        return 'Em viagem';
      case 'completed':
        return 'Viagem concluída';
      default:
        return '';
    }
  };

  const getProgressValue = () => {
    switch (status) {
      case 'searching':
        return 20;
      case 'driver-assigned':
        return 40;
      case 'driver-arriving':
        return 60;
      case 'in-transit':
        return 80;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{getStatusMessage()}</h3>
          {status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <Progress value={getProgressValue()} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'searching' && (
          <div className="text-center py-6">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gradient-viaja rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-gray-600">Encontrando o melhor motorista para você...</p>
            </div>
          </div>
        )}

        {driver && status !== 'searching' && status !== 'completed' && (
          <div className="space-y-4">
            {/* Driver Info */}
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-viaja-blue text-white font-semibold">
                  {driver.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{driver.name}</div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{driver.rating}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {driver.vehicle} • {driver.plate}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Chegada em</div>
                <div className="font-bold text-viaja-blue">{driver.eta}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 border-viaja-blue text-viaja-blue hover:bg-viaja-blue hover:text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 border-viaja-green text-viaja-green hover:bg-viaja-green hover:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Mensagem
              </Button>
            </div>

            {/* Safety Features */}
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <button className="text-viaja-blue hover:underline">
                  Compartilhar viagem
                </button>
                <button className="text-red-500 hover:underline">
                  Emergência
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && onRate && (
          <div className="text-center space-y-4">
            <div className="text-2xl">🎉</div>
            <p className="font-semibold">Viagem concluída com sucesso!</p>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Avalie sua experiência:</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRate(star)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400 hover:fill-yellow-400" />
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              className="w-full gradient-viaja text-white"
              onClick={onCancel}
            >
              Nova Corrida
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RideStatus;
