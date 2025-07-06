
import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Ban, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminHeader from '@/components/admin/AdminHeader';
import { toast } from 'sonner';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const adminData = {
    name: 'Ana Administradora',
    email: 'admin@viajamais.com',
    role: 'Super Admin'
  };

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '+55 11 99999-1111',
      status: 'Ativo',
      totalRides: 45,
      rating: 4.8,
      joinDate: '2023-08-15',
      lastActivity: '2024-01-15'
    },
    {
      id: 2,
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '+55 11 99999-2222',
      status: 'Ativo',
      totalRides: 23,
      rating: 4.5,
      joinDate: '2023-12-03',
      lastActivity: '2024-01-14'
    },
    {
      id: 3,
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '+55 11 99999-3333',
      status: 'Suspenso',
      totalRides: 12,
      rating: 3.2,
      joinDate: '2023-10-22',
      lastActivity: '2024-01-10'
    },
    {
      id: 4,
      name: 'Pedro Santos',
      email: 'pedro.santos@email.com',
      phone: '+55 11 99999-4444',
      status: 'Inativo',
      totalRides: 67,
      rating: 4.9,
      joinDate: '2023-05-18',
      lastActivity: '2023-12-20'
    }
  ]);

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

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`Status do usuário alterado para ${newStatus}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuários..."
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
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
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
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-viaja-blue">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-viaja-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'Ativo').length}
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
                  <p className="text-sm font-medium text-gray-600">Usuários Suspensos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === 'Suspenso').length}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(users.reduce((sum, u) => sum + u.rating, 0) / users.length).toFixed(1)}
                  </p>
                </div>
                <div className="text-2xl">⭐</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Usuário</th>
                    <th className="text-left py-3">Contato</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Corridas</th>
                    <th className="text-left py-3">Avaliação</th>
                    <th className="text-left py-3">Membro Desde</th>
                    <th className="text-left py-3">Última Atividade</th>
                    <th className="text-left py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{user.phone}</td>
                      <td className="py-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4">{user.totalRides}</td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          {user.rating}
                        </div>
                      </td>
                      <td className="py-4 text-sm">
                        {new Date(user.joinDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 text-sm">
                        {new Date(user.lastActivity).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.status !== 'Ativo' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'Ativo')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ativar
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'Suspenso' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'Suspenso')}>
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
    </div>
  );
};

export default UserManagement;
