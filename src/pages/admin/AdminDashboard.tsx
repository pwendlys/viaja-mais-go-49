
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Car, MapPin, DollarSign, AlertTriangle, TrendingUp, FileText, Settings } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import UserManagement from './UserManagement';
import DriverManagement from './DriverManagement';
import RideManagement from './RideManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import PricingConfig from './PricingConfig';
import RealtimeAnalytics from '@/components/admin/RealtimeAnalytics';
import AuditLogs from '@/components/admin/AuditLogs';
import SystemSettings from '@/components/admin/SystemSettings';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useDriversData } from '@/hooks/useDriversData';
import { usePatientsData } from '@/hooks/usePatientsData';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { stats, isLoading: analyticsLoading } = useAnalyticsData();
  const { drivers, isLoading: driversLoading } = useDriversData();
  const { patients, isLoading: patientsLoading } = usePatientsData();

  const adminData = {
    name: 'Administrador Municipal',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const pendingApprovals = [
    ...drivers.filter(d => d.documentsStatus === 'Pendente'),
    ...patients.filter(p => p.documentsStatus === 'Pendente')
  ];

  if (analyticsLoading || driversLoading || patientsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader admin={adminData} />
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Carregando painel administrativo...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Motoristas</span>
            </TabsTrigger>
            <TabsTrigger value="rides" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Corridas</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Preços</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Tempo Real</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
              {pendingApprovals.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      {pendingApprovals.length} aprovação(ões) pendente(s)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Corridas</p>
                      <p className="text-2xl font-bold text-viaja-blue">{stats.totalRides}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-viaja-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Total</p>
                      <p className="text-2xl font-bold text-green-600">R$ {stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Motoristas Ativos</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.activeDrivers}</p>
                    </div>
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.activeUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Métricas Detalhadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.completionRate.toFixed(1)}%
                  </div>
                  <p className="text-gray-600">
                    Corridas completadas com sucesso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avaliação Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    ⭐ {stats.avgRating.toFixed(1)}
                  </div>
                  <p className="text-gray-600">
                    Avaliação média dos motoristas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="h-6 w-6 text-blue-600 mb-2" />
                    <p className="text-sm font-medium">Gerenciar Pacientes</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('drivers')}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Car className="h-6 w-6 text-green-600 mb-2" />
                    <p className="text-sm font-medium">Gerenciar Motoristas</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <DollarSign className="h-6 w-6 text-yellow-600 mb-2" />
                    <p className="text-sm font-medium">Configurar Preços</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FileText className="h-6 w-6 text-purple-600 mb-2" />
                    <p className="text-sm font-medium">Ver Relatórios</p>
                  </button>
                </div>
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

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="realtime">
            <RealtimeAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
