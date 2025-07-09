
import React, { useState } from 'react';
import { Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminAccessButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se o usuário é admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('admin_role')
          .eq('id', data.user.id)
          .single();

        if (profileError || profile?.admin_role !== 'admin') {
          await supabase.auth.signOut();
          toast.error('Acesso negado. Você não tem permissões administrativas.');
          return;
        }

        toast.success('Login administrativo realizado com sucesso!');
        setIsOpen(false);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Erro no login admin:', error);
      toast.error('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccess = () => {
    navigate('/admin/dashboard');
  };

  return (
    <>
      {isAdmin ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDirectAccess}
          className="fixed top-4 right-4 z-50 p-2 h-auto min-w-0"
          title="Painel Administrativo"
        >
          <Shield className="h-5 w-5 text-viaja-blue" />
        </Button>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 right-4 z-50 p-2 h-auto min-w-0 opacity-20 hover:opacity-100 transition-opacity"
              title="Acesso Administrativo"
            >
              <Settings className="h-4 w-4 text-gray-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-viaja-blue" />
                <span>Acesso Administrativo</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@prefeitura.gov.br"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Senha</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Senha administrativa"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gradient-viaja text-white"
                  disabled={loading}
                >
                  {loading ? 'Verificando...' : 'Acessar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminAccessButton;
