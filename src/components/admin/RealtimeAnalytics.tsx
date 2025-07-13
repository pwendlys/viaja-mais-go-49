
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
  totalUsers: number;
  totalDrivers: number;
  totalPatients: number;
  activeUsers: number;
  recentRegistrations: number;
}

const RealtimeAnalytics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    totalDrivers: 0,
    totalPatients: 0,
    activeUsers: 0,
    recentRegistrations: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Atualizar a cada 30 segundos

    // Escutar mudanças em tempo real nas tabelas existentes
    const channel = supabase
      .channel('admin_analytics')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'drivers' 
      }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'patients' 
      }, () => {
        fetchMetrics();
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
        { count: totalUsers },
        { count: totalDrivers },
        { count: totalPatients },
        { count: activeUsers },
        profilesData
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'driver'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'patient'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(10)
      ]);

      // Calcular registros recentes (últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentRegistrations = profilesData.data?.filter(profile => 
        new Date(profile.created_at) > yesterday
      ).length || 0;

      setMetrics({
        totalUsers: totalUsers || 0,
        totalDrivers: totalDrivers || 0,
        totalPatients: totalPatients || 0,
        activeUsers: activeUsers || 0,
        recentRegistrations
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
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
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold">{metrics.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Motoristas</p>
              <p className="text-2xl font-bold">{metrics.totalDrivers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pacientes</p>
              <p className="text-2xl font-bold">{metrics.totalPatients}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold">{metrics.activeUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Registros Recentes</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {metrics.recentRegistrations}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Novos usuários nas últimas 24h
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Taxa de Atividade</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {metrics.totalUsers > 0 ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Usuários ativos vs total
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Car className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Distribuição de Usuários</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Motoristas</span>
                  <Badge variant="secondary">{metrics.totalDrivers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pacientes</span>
                  <Badge variant="secondary">{metrics.totalPatients}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Status dos Usuários</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ativos</span>
                  <Badge className="bg-green-100 text-green-800">{metrics.activeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inativos</span>
                  <Badge className="bg-gray-100 text-gray-800">{metrics.totalUsers - metrics.activeUsers}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeAnalytics;
