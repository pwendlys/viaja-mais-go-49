
import React, { useState } from 'react';
import { Car, Search, Filter, MoreVertical, CheckCircle, Ban, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminHeader from '@/components/admin/AdminHeader';
import { useDriversData } from '@/hooks/useDriversData';

const DriverManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { drivers, isLoading, updateDriverStatus, approveDocuments } = useDriversData();

  const adminData = {
    name: 'Ana Administradora',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspenso':
        return 'bg-red-100 text-red-800';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader admin={adminData} />
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Carregando motoristas...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Motoristas</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar motoristas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Motoristas</p>
                  <p className="text-2xl font-bold text-viaja-blue">{drivers.length}</p>
                </div>
                <Car className="h-8 w-8 text-viaja-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Motoristas Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {drivers.filter(d => d.status === 'Ativo').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aguardando Aprovação</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {drivers.filter(d => d.documentsStatus === 'Pendente').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {drivers.filter(d => d.rating > 0).length > 0 
                      ? (drivers.filter(d => d.rating > 0).reduce((sum, d) => sum + d.rating, 0) / drivers.filter(d => d.rating > 0).length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <div className="text-2xl">⭐</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drivers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Motoristas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Motorista</th>
                    <th className="text-left py-3">Veículo</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Documentos</th>
                    <th className="text-left py-3">Corridas</th>
                    <th className="text-left py-3">Avaliação</th>
                    <th className="text-left py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-gray-500 text-sm">{driver.phone}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{driver.vehicle}</div>
                          <div className="text-gray-500 text-sm">{driver.plate}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(driver.status)}>
                          {driver.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge className={getDocumentStatusColor(driver.documentsStatus)}>
                          {driver.documentsStatus}
                        </Badge>
                      </td>
                      <td className="py-4">{driver.totalRides}</td>
                      <td className="py-4">
                        {driver.rating > 0 ? (
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">⭐</span>
                            {driver.rating.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {driver.documentsStatus === 'Pendente' && (
                              <>
                                <DropdownMenuItem onClick={() => approveDocuments(driver.id, true)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar Documentos
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => approveDocuments(driver.id, false, 'Documentos rejeitados pelo administrador')}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Rejeitar Documentos
                                </DropdownMenuItem>
                              </>
                            )}
                            {driver.status !== 'Ativo' && driver.documentsStatus === 'Aprovado' && (
                              <DropdownMenuItem onClick={() => updateDriverStatus(driver.id, 'Ativo')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                            {driver.status !== 'Suspenso' && (
                              <DropdownMenuItem onClick={() => updateDriverStatus(driver.id, 'Suspenso')}>
                                <Ban className="h-4 w-4 mr-2" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
  );
};

export default DriverManagement;
