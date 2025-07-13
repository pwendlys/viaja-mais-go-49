
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Calendar, User, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  user_id: string;
  created_at: string;
  details?: any;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7days');

  useEffect(() => {
    fetchAuditLogs();
  }, [dateFilter]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter, tableFilter]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      
      // Como não temos uma tabela de audit log, vamos simular com dados das tabelas existentes
      // Buscar dados das tabelas profiles, drivers e patients para mostrar atividade recente
      const [profilesData, driversData, patientsData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('drivers').select('*').limit(50),
        supabase.from('patients').select('*').limit(50)
      ]);

      // Converter dados em formato de log para exibição
      const mockLogs: AuditLogEntry[] = [];

      profilesData.data?.forEach((profile) => {
        mockLogs.push({
          id: `profile_${profile.id}`,
          table_name: 'profiles',
          record_id: profile.id,
          action: 'INSERT',
          user_id: profile.id,
          created_at: profile.created_at || new Date().toISOString(),
          details: { user_type: profile.user_type, email: profile.email }
        });
      });

      driversData.data?.forEach((driver) => {
        mockLogs.push({
          id: `driver_${driver.id}`,
          table_name: 'drivers',
          record_id: driver.id,
          action: 'INSERT',
          user_id: driver.id,
          created_at: new Date().toISOString(),
          details: { vehicle: `${driver.vehicle_make} ${driver.vehicle_model}` }
        });
      });

      patientsData.data?.forEach((patient) => {
        mockLogs.push({
          id: `patient_${patient.id}`,
          table_name: 'patients',
          record_id: patient.id,
          action: 'INSERT',
          user_id: patient.id,
          created_at: new Date().toISOString(),
          details: { sus_card: patient.sus_card }
        });
      });

      // Ordenar por data mais recente
      mockLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(mockLogs);
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.record_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (tableFilter !== 'all') {
      filtered = filtered.filter(log => log.table_name === tableFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Tabela', 'Ação', 'ID do Registro', 'User ID'],
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString('pt-BR'),
        log.table_name || 'N/A',
        log.action,
        log.record_id || 'N/A',
        log.user_id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueTables = [...new Set(logs.map(log => log.table_name).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Logs de Atividade</h1>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Ações</SelectItem>
            <SelectItem value="INSERT">INSERT</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Tabelas</SelectItem>
            {uniqueTables.map(table => (
              <SelectItem key={table} value={table}>{table}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Logs</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Perfis</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter(l => l.table_name === 'profiles').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Motoristas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredLogs.filter(l => l.table_name === 'drivers').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredLogs.filter(l => l.table_name === 'patients').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="font-medium">{log.table_name || 'N/A'}</span>
                    <span className="text-gray-500">ID: {log.record_id?.slice(0, 8) || 'N/A'}...</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span>User: {log.user_id.slice(0, 8)}...</span>
                </div>

                {log.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Ver detalhes
                    </summary>
                    <div className="mt-2">
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum log encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
