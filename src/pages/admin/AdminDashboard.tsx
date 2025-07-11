
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, Activity } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAdminAuth();

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Acesso Negado</h2>
              <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
              <a href="/login" className="text-blue-600 hover:underline">
                Fazer login como administrador
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                  Banco de dados limpo e reconfigurado com sucesso. 
                  Sistema pronto para configuração adicional.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Usuário Administrador</h3>
                <p className="text-sm text-gray-600">
                  Login: {user?.email}<br/>
                  Status: Ativo<br/>
                  Permissões: Administrador completo
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Próximos Passos</h3>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Configurar módulos do sistema conforme necessário</li>
                  <li>Adicionar funcionalidades específicas</li>
                  <li>Configurar permissões e usuários adicionais</li>
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
