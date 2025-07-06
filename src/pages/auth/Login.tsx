
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'driver' | 'admin'>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - in real app this would make API call
    if (formData.email && formData.password) {
      toast.success('Login realizado com sucesso!');
      
      // Redirect based on user type
      switch (userType) {
        case 'user':
          navigate('/user/dashboard');
          break;
        case 'driver':
          navigate('/driver/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
      }
    } else {
      toast.error('Por favor, preencha todos os campos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-viaja-blue/10 to-viaja-green/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-viaja rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-viaja bg-clip-text text-transparent">
            Entrar no Viaja+
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => setUserType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="user">Usuário</TabsTrigger>
              <TabsTrigger value="driver">Motorista</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value={userType} className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full gradient-viaja text-white">
                  Entrar como {userType === 'user' ? 'Usuário' : userType === 'driver' ? 'Motorista' : 'Administrador'}
                </Button>
                
                <div className="text-center space-y-2">
                  <Link to="/register" className="text-sm text-viaja-blue hover:underline">
                    Não tem conta? Cadastre-se
                  </Link>
                  <br />
                  <Link to="/" className="text-sm text-gray-600 hover:underline">
                    Voltar ao início
                  </Link>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
