import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Car, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemMetrics {
  activeUsers: number;
  availableDrivers: number;
  activeRides: number;
  totalRevenue: number;
  avgResponseTime: number;
  successRate: number;
}

interface NotificationStats {
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

const RealtimeAnalytics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    availableDrivers: 0,
    activeRides: 0,
    totalRevenue: 0,
    avgResponseTime: 0,
    successRate: 0
  });

  const [notificationStats, setNotificationStats] = useState<NotificationStats>({
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Atualizar a cada 30 segundos

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('admin_analytics')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rides' 
      }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'realtime_notifications' 
      }, () => {
        fetchNotificationStats();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const [
        { count: activeRides },
        { count: availableDrivers },
        { data: revenueData },
        { data: ridesData }
      ] = await Promise.all([
        supabase.from('rides').select('*', { count: 'exact' }).in('status', ['requested', 'assigned', 'in-progress']),
        supabase.from('drivers').select('*', { count: 'exact' }).eq('is_available', true),
        supabase.from('rides').select('price').eq('status', 'completed'),
        supabase.from('rides').select('created_at, updated_at').eq('status', 'completed')
      ]);

      const totalRevenue = revenueData?.reduce((sum, ride) => sum + (ride.price || 0), 0) || 0;
      
      // Calcular tempo médio de resposta (em minutos)
      const avgResponseTime = ridesData?.length ? 
        ridesData.reduce((sum, ride) => {
          const created = new Date(ride.created_at);
          const updated = new Date(ride.updated_at);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60);
        }, 0) / ridesData.length : 0;

      // Calcular taxa de sucesso (corridas completadas vs canceladas)
      const { count: completedRides } = await supabase
        .from('rides')
        .select('*', { count: 'exact' })
        .eq('status', 'completed');

      const { count: totalRides } = await supabase
        .from('rides')
        .select('*', { count: 'exact' });

      const successRate = totalRides ? (completedRides / totalRides) * 100 : 0;

      setMetrics({
        activeUsers: 0, // Implementar contagem de usuários ativos
        availableDrivers: availableDrivers || 0,
        activeRides: activeRides || 0,
        totalRevenue,
        avgResponseTime,
        successRate
      });

      await fetchNotificationStats();
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const [
        { count: sent },
        { count: delivered },
        { count: failed },
        { count: pending }
      ] = await Promise.all([
        supabase.from('realtime_notifications').select('*', { count: 'exact' }).eq('status', 'sent'),
        supabase.from('realtime_notifications').select('*', { count: 'exact' }).eq('status', 'delivered'),
        supabase.from('realtime_notifications').select('*', { count: 'exact' }).eq('status', 'failed'),
        supabase.from('realtime_notifications').select('*', { count: 'exact' }).eq('status', 'pending')
      ]);

      setNotificationStats({
        sent: sent || 0,
        delivered: delivered || 0,
        failed: failed || 0,
        pending: pending || 0
      });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const refreshViews = async () => {
    try {
      setIsLoading(true);
      await fetchMetrics();
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Erro ao atualizar dados');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics em Tempo Real</h1>
        <Button onClick={refreshViews} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold">{metrics.activeUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Motoristas Disponíveis</p>
              <p className="text-2xl font-bold">{metrics.availableDrivers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Corridas Ativas</p>
              <p className="text-2xl font-bold">{metrics.activeRides}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold">R$ {metrics.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Tempo Médio de Resposta</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {metrics.avgResponseTime.toFixed(1)}min
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Tempo entre solicitação e aceite
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Taxa de Sucesso</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {metrics.successRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Corridas completadas vs canceladas
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Entregues</p>
                  <p className="text-2xl font-bold text-green-600">
                    {notificationStats.delivered}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Enviadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {notificationStats.sent}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {notificationStats.pending}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Falharam</p>
                  <p className="text-2xl font-bold text-red-600">
                    {notificationStats.failed}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Taxa de Entrega de Notificações</h3>
            <div className="space-y-2">
              {[
                { label: 'Entregues', value: notificationStats.delivered, color: 'bg-green-500' },
                { label: 'Enviadas', value: notificationStats.sent, color: 'bg-blue-500' },
                { label: 'Pendentes', value: notificationStats.pending, color: 'bg-orange-500' },
                { label: 'Falharam', value: notificationStats.failed, color: 'bg-red-500' }
              ].map((item) => {
                const total = Object.values(notificationStats).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-gray-600">{item.label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeAnalytics;
