
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, CheckCircle } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { userProfile, loading } = useAuth();

  const adminData = {
    name: 'Administrador Sistema',
    email: 'admin@adm.com',
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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <p className="text-gray-600">Sistema limpo e reconfigurado com sucesso</p>
        </div>

        {/* Status do sistema após limpeza */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Banco de Dados</p>
                  <p className="text-2xl font-bold text-green-800">Limpo</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Sistema Admin</p>
                  <p className="text-2xl font-bold text-blue-800">Ativo</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Configuração</p>
                  <p className="text-2xl font-bold text-purple-800">Completa</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">✅ Limpeza Concluída</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Todas as tabelas antigas removidas</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Todos os dados antigos apagados</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Estrutura simplificada criada</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Segurança RLS configurada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">👤 Usuário Administrativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Credenciais de Acesso</h3>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p><strong>Email:</strong> admin@adm.com</p>
                    <p><strong>Senha:</strong> adm@2025</p>
                    <p><strong>Tipo:</strong> Administrador</p>
                    <p><strong>Status:</strong> <span className="text-green-600 font-medium">Ativo</span></p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Acesso Exclusivo:</strong> Apenas este usuário pode acessar o sistema. 
                    Todos os outros tipos de usuário foram removidos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos passos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• O sistema está agora limpo e configurado apenas para administração</p>
              <p>• Você pode começar a recriar as funcionalidades conforme necessário</p>
              <p>• Todas as migrações antigas foram removidas e o banco está em estado inicial</p>
              <p>• O login está restrito apenas ao usuário admin@adm.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
