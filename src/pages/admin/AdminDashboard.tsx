
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, Activity } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { userProfile, loading } = useAuth();

  const adminData = {
    name: 'Administrador',
    email: 'adm@adm.com',
    role: 'Admin'
  };

  if (loading) {
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

  if (!userProfile || userProfile.user_type !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
          <p className="text-gray-600">Bem-vindo ao painel de controle</p>
        </div>

        {/* Métricas básicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sistema</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Banco de Dados</p>
                  <p className="text-2xl font-bold text-blue-600">Conectado</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Configurações</p>
                  <p className="text-2xl font-bold text-purple-600">Ativas</p>
                </div>
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Status do Banco de Dados</h3>
                <p className="text-sm text-gray-600">
                  Sistema de autenticação configurado para todos os tipos de usuários.
                  Banco de dados reconfigurado com sucesso.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Usuário Administrador</h3>
                <p className="text-sm text-gray-600">
                  Login: {userProfile?.email}<br/>
                  Nome: {userProfile?.full_name}<br/>
                  Tipo: {userProfile?.user_type}<br/>
                  Status: Ativo
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Sistema de Login</h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Admin: Redirecionamento para /admin/dashboard</li>
                  <li>Paciente: Redirecionamento para /user/dashboard</li>
                  <li>Motorista: Redirecionamento para /driver/dashboard</li>
                  <li>Sistema de cadastro disponível em /auth/register</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
