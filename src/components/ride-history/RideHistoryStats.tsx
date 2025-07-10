
import React from 'react';
import { MapPin, CheckCircle2, Calendar, XCircle, Star, Route } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RideHistoryStats } from '@/types/rideHistory';

interface RideHistoryStatsProps {
  stats: RideHistoryStats;
}

const RideHistoryStatsComponent: React.FC<RideHistoryStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: MapPin,
      label: 'Total de Viagens',
      value: stats.total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: CheckCircle2,
      label: 'Concluídas',
      value: stats.completed,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Calendar,
      label: 'Agendadas',
      value: stats.scheduled,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: XCircle,
      label: 'Canceladas',
      value: stats.cancelled,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  // Adicionar estatísticas opcionais se disponíveis
  if (stats.averageRating) {
    statItems.push({
      icon: Star,
      label: 'Avaliação Média',
      value: stats.averageRating.toFixed(1),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    });
  }

  if (stats.totalDistance) {
    statItems.push({
      icon: Route,
      label: 'Distância Total',
      value: `${stats.totalDistance.toFixed(1)} km`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    });
  }

  return (
    <Card className="bg-gradient-to-r from-viaja-blue/5 to-viaja-blue/10 border-viaja-blue/20">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h3 className="font-semibold text-viaja-blue text-lg mb-2">
            📊 Estatísticas do Histórico
          </h3>
          <p className="text-sm text-gray-600">
            Resumo das suas viagens no sistema de transporte municipal
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`${item.bgColor} rounded-lg p-4 text-center hover:shadow-sm transition-shadow`}
              >
                <div className="flex justify-center mb-2">
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <p className={`text-2xl font-bold ${item.color} mb-1`}>
                  {item.value}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Insights adicionais */}
        {stats.total > 0 && (
          <div className="mt-6 pt-4 border-t border-viaja-blue/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="text-center">
                <span className="font-medium">Taxa de Conclusão:</span>
                <span className="ml-1 text-green-600 font-semibold">
                  {((stats.completed / stats.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-center">
                <span className="font-medium">Taxa de Cancelamento:</span>
                <span className="ml-1 text-red-600 font-semibold">
                  {((stats.cancelled / stats.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RideHistoryStatsComponent;
