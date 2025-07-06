
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Car, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Area, 
  AreaChart 
} from 'recharts';

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const adminData = {
    name: 'Ana Administradora',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const kpis = {
    totalRevenue: 245680.50,
    totalRides: 15847,
    activeUsers: 12547,
    activeDrivers: 2834,
    avgRating: 4.7,
    completionRate: 94.2
  };

  const dailyStats = [
    { date: '01/01', rides: 245, revenue: 4580, users: 189 },
    { date: '02/01', rides: 312, revenue: 5230, users: 234 },
    { date: '03/01', rides: 289, revenue: 4890, users: 201 },
    { date: '04/01', rides: 378, revenue: 6120, users: 298 },
    { date: '05/01', rides: 456, revenue: 7340, users: 356 },
    { date: '06/01', reads: 523, revenue: 8450, users: 412 },
    { date: '07/01', rides: 412, revenue: 6890, users: 334 }
  ];

  const ridesByHour = [
    { hour: '00h', rides: 12 },
    { hour: '04h', rides: 8 },
    { hour: '08h', rides: 145 },
    { hour: '12h', rides: 234 },
    { hour: '16h', rides: 189 },
    { hour: '20h', rides: 267 },
    { hour: '23h', rides: 45 }
  ];

  const topRoutes = [
    { route: 'Aeroporto → Centro', rides: 1247, revenue: 28950 },
    { route: 'Shopping → Residencial', rides: 1034, revenue: 19870 },
    { route: 'Universidade → Centro', rides: 892, revenue: 15680 },
    { route: 'Hospital → Residencial', rides: 654, revenue: 12340 },
    { route: 'Centro → Aeroporto', rides: 578, revenue: 13450 }
  ];

  const userTypes = [
    { name: 'Usuários Regulares', value: 8547, color: '#3b82f6' },
    { name: 'Usuários Premium', value: 2834, color: '#f59e0b' },
    { name: 'Usuários Corporativos', value: 1166, color: '#10b981' }
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {kpis.totalRevenue.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Corridas</p>
                    <p className="text-lg font-bold text-viaja-blue">
                      {kpis.totalRides.toLocaleString()}
                    </p>
                  </div>
                  <Car className="h-6 w-6 text-viaja-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-lg font-bold text-viaja-green">
                      {kpis.activeUsers.toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-viaja-green" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Motoristas Ativos</p>
                    <p className="text-lg font-bold text-viaja-orange">
                      {kpis.activeDrivers.toLocaleString()}
                    </p>
                  </div>
                  <Car className="h-6 w-6 text-viaja-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                    <p className="text-lg font-bold text-yellow-600">{kpis.avgRating}</p>
                  </div>
                  <div className="text-xl">⭐</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa Conclusão</p>
                    <p className="text-lg font-bold text-green-600">{kpis.completionRate}%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Corridas e Receita Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="rides" 
                      stackId="1"
                      stroke="hsl(var(--viaja-blue))" 
                      fill="hsl(var(--viaja-blue))" 
                      fillOpacity={0.3}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--viaja-green))" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Corridas por Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ridesByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rides" fill="hsl(var(--viaja-orange))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Rotas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{route.route}</div>
                          <div className="text-sm text-gray-600">{route.rides} corridas</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-viaja-green">
                          R$ {route.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
