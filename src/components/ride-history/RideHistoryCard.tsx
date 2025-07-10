
import React from 'react';
import { Calendar, MapPin, Clock, Star, XCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RideHistoryItem } from '@/types/rideHistory';

interface RideHistoryCardProps {
  ride: RideHistoryItem;
  onViewDetails: (ride: RideHistoryItem) => void;
  onCancel?: (rideId: string) => void;
  onRate?: (rideId: string, rating: number) => void;
}

const RideHistoryCard: React.FC<RideHistoryCardProps> = ({
  ride,
  onViewDetails,
  onCancel,
  onRate
}) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'scheduled': { label: 'Agendado', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      'confirmed': { label: 'Confirmado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'in_progress': { label: 'Em Andamento', variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Concluído', variant: 'default' as const, color: 'bg-emerald-100 text-emerald-800' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const,
      color: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getTransportTypeBadge = (type: string) => {
    const typeInfo = type === 'acessivel' 
      ? { label: 'Acessível', color: 'bg-purple-100 text-purple-800' }
      : { label: 'Tradicional', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400 text-sm">Não avaliado</span>;
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const canCancel = ride.status === 'scheduled' || ride.status === 'confirmed';
  const canRate = ride.status === 'completed' && !ride.service_rating;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
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
                  <Badge variant="outline" className="text-xs">
                    {ride.notes}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(ride.status)}
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center mt-1 space-y-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Origem</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{ride.origin_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Destino</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{ride.destination_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Distância</p>
              <p className="text-sm font-medium">
                {ride.distance_km ? `${ride.distance_km} km` : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Duração</p>
              <p className="text-sm font-medium">
                {ride.duration_minutes ? `${ride.duration_minutes} min` : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Valor</p>
              <p className="text-sm font-medium text-green-600">Gratuito</p>
            </div>
          </div>

          {/* Rating */}
          {ride.status === 'completed' && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Sua avaliação</p>
                  {getRatingStars(ride.service_rating)}
                </div>
                {canRate && onRate && (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onRate(ride.id, star)}
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

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(ride)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>Ver Detalhes</span>
            </Button>
            
            <div className="flex space-x-2">
              {canCancel && onCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(ride.id)}
                  className="flex items-center space-x-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RideHistoryCard;
