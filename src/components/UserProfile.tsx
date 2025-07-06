
import React from 'react';
import { User, Star, CreditCard, Clock, MapPin, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    rating: number;
    totalTrips: number;
    memberSince: string;
  };
  onClose: () => void;
}

const UserProfile = ({ user, onClose }: UserProfileProps) => {
  const recentTrips = [
    {
      id: 1,
      from: 'Shopping Center',
      to: 'Centro da Cidade',
      date: '2024-01-15',
      price: 'R$ 12,50',
      rating: 5
    },
    {
      id: 2,
      from: 'Aeroporto',
      to: 'Hotel Central',
      date: '2024-01-10',
      price: 'R$ 28,90',
      rating: 4
    },
    {
      id: 3,
      from: 'Universidade',
      to: 'Casa',
      date: '2024-01-08',
      price: 'R$ 15,20',
      rating: 5
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-gradient-viaja text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{user.rating}</span>
                </div>
                
                <Badge variant="secondary">
                  {user.totalTrips} viagens
                </Badge>
                
                <Badge variant="outline">
                  Desde {user.memberSince}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-viaja-blue">{user.totalTrips}</div>
            <div className="text-sm text-gray-600">Viagens Realizadas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-viaja-green">4.8</div>
            <div className="text-sm text-gray-600">Avaliação Média</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-viaja-orange">15%</div>
            <div className="text-sm text-gray-600">Desconto Fidelidade</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Viagens Recentes</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {recentTrips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-viaja-blue" />
                <div>
                  <div className="font-medium text-sm">{trip.from} → {trip.to}</div>
                  <div className="text-xs text-gray-600">{trip.date}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-sm">{trip.price}</div>
                <div className="flex items-center">
                  {Array.from({ length: trip.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="w-4 h-4 mr-2" />
            Métodos de Pagamento
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Configurações da Conta
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Star className="w-4 h-4 mr-2" />
            Programa de Fidelidade
          </Button>
        </CardContent>
      </Card>

      <Button onClick={onClose} className="w-full" variant="outline">
        Voltar ao Mapa
      </Button>
    </div>
  );
};

export default UserProfile;
