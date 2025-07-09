
import React, { useState, useEffect } from 'react';
import { Users, Car, MapPin, DollarSign, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminHeader from '@/components/admin/AdminHeader';
import UserManagement from './UserManagement';
import DriverManagement from './DriverManagement';
import RideManagement from './RideManagement';
import PricingConfig from './PricingConfig';
import { healthTransportApi } from '@/services/healthTransportApi';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_patients: 0,
    total_drivers: 0,
    total_rides: 0,
    active_rides: 0,
    available_drivers: 0
  });
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminData = {
    name: 'Administrador Municipal',
    email: 'admin@prefeitura.gov.br',
    role: 'Super Admin'
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await healthTransportApi.getDashboardStats();
      setStats(data.stats);
      setRecentRides(data.recent_rides);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viaja-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Sistema de gestão do transporte de saúde municipal
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="drivers">Motoristas</TabsTrigger>
            <TabsTrigger value="rides">Corridas</TabsTrigger>
            <TabsTrigger value="pricing">Preços</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                      <p className="text-2xl font-bold text-viaja-blue">{stats.total_patients}</p>
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
                      <p className="text-2xl font-bold text-viaja-green">{stats.total_drivers}</p>
                    </div>
                    <Car className="h-8 w-8 text-viaja-green" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Corridas</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.total_rides}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Corridas Ativas</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.active_rides}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Aprovações Pendentes</h3>
                      <p className="text-sm text-gray-600">Revisar cadastros pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Pagamentos</h3>
                      <p className="text-sm text-gray-600">Gerenciar pagamentos aos motoristas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Relatórios</h3>
                      <p className="text-sm text-gray-600">Gerar relatórios detalhados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Rides */}
            <Card>
              <CardHeader>
                <CardTitle>Corridas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {recentRides.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma corrida registrada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentRides.slice(0, 5).map((ride: any) => (
                      <div key={ride.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{ride.profiles?.full_name || 'Paciente'}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ride.status)}`}>
                              {ride.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {ride.origin_address} → {ride.destination_address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {ride.price?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(ride.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="drivers">
            <DriverManagement />
          </TabsContent>

          <TabsContent value="rides">
            <RideManagement />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingConfig />
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Relatórios em Desenvolvimento
                    </h3>
                    <p className="text-gray-500">
                      Esta seção permitirá gerar relatórios detalhados das corridas, pagamentos e performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
