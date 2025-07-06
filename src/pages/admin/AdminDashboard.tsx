
import React from 'react';
import { Users, Car, MapPin, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminHeader from '@/components/admin/AdminHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const adminData = {
    name: 'Ana Administradora',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const stats = {
    totalUsers: 12547,
    totalDrivers: 2834,
    activeRides: 89,
    totalRevenue: 245680.50,
    dailyGrowth: 5.2,
    monthlyGrowth: 18.7
  };

  const ridesData = [
    { name: 'Seg', rides: 245 },
    { name: 'Ter', rides: 312 },
    { name: 'Qua', rides: 289 },
    { name: 'Qui', rides: 378 },
    { name: 'Sex', rides: 456 },
    { name: 'Sab', rides: 523 },
    { name: 'Dom', rides: 412 }
  ];

  const revenueData = [
    { name: 'Jan', revenue: 18500 },
    { name: 'Fev', revenue: 22300 },
    { name: 'Mar', revenue: 25100 },
    { name: 'Abr', revenue: 28900 },
    { name: 'Mai', revenue: 31200 },
    { name: 'Jun', revenue: 34600 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'Novo usuário registrado: Maria Silva',
      time: '2 min atrás'
    },
    {
      id: 2,
      type: 'driver_approval',
      message: 'Motorista aprovado: João Santos',
      time: '5 min atrás'
    },
    {
      id: 3,
      type: 'ride_completed',
      message: 'Corrida concluída: R$ 25,80',
      time: '8 min atrás'
    },
    {
      id: 4,
      type: 'payment_issue',
      message: 'Problema de pagamento reportado',
      time: '12 min atrás'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-2xl font-bold text-viaja-blue">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-viaja-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Motoristas</p>
                    <p className="text-2xl font-bold text-viaja-green">{stats.totalDrivers.toLocaleString()}</p>
                  </div>
                  <Car className="h-8 w-8 text-viaja-green" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Corridas Ativas</p>
                    <p className="text-2xl font-bold text-viaja-orange">{stats.activeRides}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-viaja-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Corridas por Dia da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ridesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rides" fill="hsl(var(--viaja-blue))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--viaja-green))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Growth Metrics & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Métricas de Crescimento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Crescimento Diário</span>
                  <Badge className="bg-green-100 text-green-800">
                    +{stats.dailyGrowth}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Crescimento Mensal</span>
                  <Badge className="bg-green-100 text-green-800">
                    +{stats.monthlyGrowth}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Retenção</span>
                  <Badge className="bg-blue-100 text-blue-800">87%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Satisfação do Cliente</span>
                  <Badge className="bg-yellow-100 text-yellow-800">4.8/5</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Atividades Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-viaja-blue rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
