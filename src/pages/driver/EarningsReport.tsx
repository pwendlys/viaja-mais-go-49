
import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DriverHeader from '@/components/driver/DriverHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const EarningsReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const driverData = {
    name: 'João Santos',
    email: 'joao.santos@email.com',
    rating: 4.9,
    totalRides: 324,
    memberSince: '2022',
    vehicle: 'Honda Civic 2020',
    plate: 'ABC-1234'
  };

  const earningsData = {
    today: 156.80,
    week: 1240.50,
    month: 4830.20,
    total: 25680.90
  };

  const weeklyData = [
    { day: 'Seg', earnings: 180.50, rides: 8 },
    { day: 'Ter', earnings: 220.30, rides: 12 },
    { day: 'Qua', earnings: 156.80, rides: 7 },
    { day: 'Qui', earnings: 290.40, rides: 15 },
    { day: 'Sex', earnings: 312.70, rides: 18 },
    { day: 'Sab', earnings: 245.90, rides: 14 },
    { day: 'Dom', earnings: 190.60, rides: 10 }
  ];

  const monthlyData = [
    { month: 'Jul', earnings: 4200 },
    { month: 'Ago', earnings: 4650 },
    { month: 'Set', earnings: 4830 },
    { month: 'Out', earnings: 5120 },
    { month: 'Nov', earnings: 4890 },
    { month: 'Dez', earnings: 5340 }
  ];

  const recentPayments = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 156.80,
      rides: 8,
      status: 'Pago',
      method: 'PIX'
    },
    {
      id: 2,
      date: '2024-01-14',
      amount: 220.30,
      rides: 12,
      status: 'Pago',
      method: 'PIX'
    },
    {
      id: 3,
      date: '2024-01-13',
      amount: 189.50,
      rides: 9,
      status: 'Pendente',
      method: 'PIX'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Atrasado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driver={driverData} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Relatório de Ganhos</h1>
          <div className="flex space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hoje</p>
                    <p className="text-2xl font-bold text-viaja-green">
                      R$ {earningsData.today.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-viaja-green" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                    <p className="text-2xl font-bold text-viaja-blue">
                      R$ {earningsData.week.toFixed(2)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-viaja-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Este Mês</p>
                    <p className="text-2xl font-bold text-viaja-orange">
                      R$ {earningsData.month.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-viaja-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Acumulado</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {earningsData.total.toFixed(2)}
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
                <CardTitle>Ganhos Semanais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Ganhos']} />
                    <Bar dataKey="earnings" fill="hsl(var(--viaja-green))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendência Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Ganhos']} />
                    <Line type="monotone" dataKey="earnings" stroke="hsl(var(--viaja-blue))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Data</th>
                      <th className="text-left py-2">Valor</th>
                      <th className="text-left py-2">Corridas</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Método</th>
                      <th className="text-left py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="py-3">
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 font-semibold text-viaja-green">
                          R$ {payment.amount.toFixed(2)}
                        </td>
                        <td className="py-3">{payment.rides} corridas</td>
                        <td className="py-3">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3">{payment.method}</td>
                        <td className="py-3">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EarningsReport;
