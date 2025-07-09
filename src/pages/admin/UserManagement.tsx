
import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Ban, CheckCircle, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePatientsData } from '@/hooks/usePatientsData';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const { patients, isLoading, updatePatientStatus, approveDocuments } = usePatientsData();

  const adminData = {
    name: 'Ana Administradora',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800';
      case 'Suspenso':
        return 'bg-red-100 text-red-800';
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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || patient.documentsStatus === approvalFilter;
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const pendingApprovals = patients.filter(p => p.documentsStatus === 'Pendente');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader admin={adminData} />
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Carregando pacientes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Pacientes</h2>
          <p className="text-gray-600">Controle de cadastros e aprovações de pacientes</p>
        </div>
        
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

      <div className="flex space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar pacientes..."
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
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Suspenso">Suspenso</SelectItem>
          </SelectContent>
        </Select>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por aprovação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Aprovações</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Aprovado">Aprovado</SelectItem>
            <SelectItem value="Rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-viaja-blue">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-viaja-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter(u => u.status === 'Ativo').length}
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
                <p className="text-sm font-medium text-gray-600">Aprovações Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {patients.filter(u => u.documentsStatus === 'Pendente').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {patients.filter(u => u.rating > 0).length > 0
                    ? (patients.filter(u => u.rating > 0).reduce((sum, u) => sum + u.rating, 0) / patients.filter(u => u.rating > 0).length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Paciente</th>
                  <th className="text-left py-3">Contato</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Aprovação</th>
                  <th className="text-left py-3">Corridas</th>
                  <th className="text-left py-3">Avaliação</th>
                  <th className="text-left py-3">Endereço</th>
                  <th className="text-left py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-gray-500 text-sm">SUS: {patient.susNumber || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 text-sm">{patient.phone}</td>
                    <td className="py-4">
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge className={getDocumentStatusColor(patient.documentsStatus)}>
                        {patient.documentsStatus}
                      </Badge>
                    </td>
                    <td className="py-4">{patient.totalRides}</td>
                    <td className="py-4">
                      {patient.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          {patient.rating.toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 text-sm max-w-xs truncate">
                      {patient.address || 'N/A'}
                    </td>
                    <td className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {patient.documentsStatus === 'Pendente' && (
                            <>
                              <DropdownMenuItem onClick={() => approveDocuments(patient.id, true)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovar Cadastro
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => approveDocuments(patient.id, false, 'Documentos rejeitados pelo administrador')}>
                                <Ban className="h-4 w-4 mr-2" />
                                Rejeitar Cadastro
                              </DropdownMenuItem>
                            </>
                          )}
                          {patient.status !== 'Ativo' && patient.documentsStatus === 'Aprovado' && (
                            <DropdownMenuItem onClick={() => updatePatientStatus(patient.id, 'Ativo')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          {patient.status !== 'Suspenso' && (
                            <DropdownMenuItem onClick={() => updatePatientStatus(patient.id, 'Suspenso')}>
                              <Ban className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </DropdownMenuItem>
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
  );
};

export default UserManagement;
