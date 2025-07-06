
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Car, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'driver'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Driver specific fields
    driverLicense: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    bankAccount: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    // Mock registration - in real app this would make API call
    toast.success('Cadastro realizado com sucesso!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-viaja-blue/10 to-viaja-green/10 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-viaja rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-viaja bg-clip-text text-transparent">
            Cadastrar no Viaja+
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => setUserType(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">Usuário</TabsTrigger>
              <TabsTrigger value="driver">Motorista</TabsTrigger>
            </TabsList>
            
            <TabsContent value={userType} className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                
                {/* Driver specific fields */}
                {userType === 'driver' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="driverLicense">CNH</Label>
                      <Input
                        id="driverLicense"
                        placeholder="Número da CNH"
                        value={formData.driverLicense}
                        onChange={(e) => setFormData({...formData, driverLicense: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Marca</Label>
                        <Input
                          id="vehicleMake"
                          placeholder="Honda"
                          value={formData.vehicleMake}
                          onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Modelo</Label>
                        <Input
                          id="vehicleModel"
                          placeholder="Civic"
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Ano</Label>
                        <Input
                          id="vehicleYear"
                          placeholder="2020"
                          value={formData.vehicleYear}
                          onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehiclePlate">Placa</Label>
                        <Input
                          id="vehiclePlate"
                          placeholder="ABC-1234"
                          value={formData.vehiclePlate}
                          onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Conta Bancária</Label>
                      <Input
                        id="bankAccount"
                        placeholder="Banco - Agência - Conta"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}
                
                <Button type="submit" className="w-full gradient-viaja text-white">
                  Cadastrar como {userType === 'user' ? 'Usuário' : 'Motorista'}
                </Button>
                
                <div className="text-center space-y-2">
                  <Link to="/login" className="text-sm text-viaja-blue hover:underline">
                    Já tem conta? Faça login
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

export default Register;
