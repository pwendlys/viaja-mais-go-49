
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Car, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { healthTransportApi } from '@/services/healthTransportApi';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'driver'>('patient');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Patient specific fields
    susNumber: '',
    address: '',
    neighborhood: '',
    city: 'Juiz de Fora',
    state: 'MG',
    medicalCondition: '',
    mobilityNeeds: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Driver specific fields
    driverLicense: '',
    licenseExpiry: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    vehicleColor: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name,
            user_type: userType
          }
        }
      });

      if (authError) {
        toast.error('Erro ao criar conta: ' + authError.message);
        return;
      }

      if (authData.user) {
        // Prepare profile data
        const profileData = {
          full_name: formData.name,
          phone: formData.phone,
          user_type: userType
        };

        // Prepare specific data based on user type
        let specificData = {};
        if (userType === 'patient') {
          specificData = {
            sus_number: formData.susNumber,
            address: formData.address,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            medical_condition: formData.medicalCondition,
            mobility_needs: formData.mobilityNeeds,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone
          };
        } else if (userType === 'driver') {
          specificData = {
            license_number: formData.driverLicense,
            license_expiry: formData.licenseExpiry,
            vehicle_plate: formData.vehiclePlate,
            vehicle_model: `${formData.vehicleMake} ${formData.vehicleModel}`,
            vehicle_year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
            vehicle_color: formData.vehicleColor,
            is_available: false
          };
        }

        // Complete profile using the API service
        await healthTransportApi.completeProfile(
          authData.user.id,
          userType,
          profileData,
          specificData
        );

        toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error('Erro ao completar cadastro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-viaja-blue/10 to-viaja-green/10 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-viaja rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-viaja bg-clip-text text-transparent">
            Cadastrar no Viaja+
          </CardTitle>
          <p className="text-gray-600">Transporte Saúde Municipal</p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => setUserType(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Paciente
              </TabsTrigger>
              <TabsTrigger value="driver" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Motorista
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={userType} className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Informações Básicas</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        placeholder="(32) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
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
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Patient specific fields */}
                {userType === 'patient' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Informações do Paciente</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="susNumber">Número do SUS</Label>
                      <Input
                        id="susNumber"
                        placeholder="Número do cartão SUS"
                        value={formData.susNumber}
                        onChange={(e) => setFormData({...formData, susNumber: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço Completo *</Label>
                      <Input
                        id="address"
                        placeholder="Rua, número, complemento"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input
                          id="neighborhood"
                          placeholder="Nome do bairro"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="medicalCondition">Condição Médica</Label>
                      <Textarea
                        id="medicalCondition"
                        placeholder="Descreva sua condição médica (opcional)"
                        value={formData.medicalCondition}
                        onChange={(e) => setFormData({...formData, medicalCondition: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mobilityNeeds">Necessidades de Mobilidade</Label>
                      <Textarea
                        id="mobilityNeeds"
                        placeholder="Cadeira de rodas, andador, etc. (opcional)"
                        value={formData.mobilityNeeds}
                        onChange={(e) => setFormData({...formData, mobilityNeeds: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Contato de Emergência</Label>
                        <Input
                          id="emergencyContactName"
                          placeholder="Nome do contato"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Telefone do Contato</Label>
                        <Input
                          id="emergencyContactPhone"
                          placeholder="(32) 99999-9999"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Driver specific fields */}
                {userType === 'driver' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Informações do Motorista</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="driverLicense">CNH *</Label>
                        <Input
                          id="driverLicense"
                          placeholder="Número da CNH"
                          value={formData.driverLicense}
                          onChange={(e) => setFormData({...formData, driverLicense: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="licenseExpiry">Validade da CNH *</Label>
                        <Input
                          id="licenseExpiry"
                          type="date"
                          value={formData.licenseExpiry}
                          onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Marca do Veículo *</Label>
                        <Input
                          id="vehicleMake"
                          placeholder="Honda, Toyota, etc."
                          value={formData.vehicleMake}
                          onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Modelo *</Label>
                        <Input
                          id="vehicleModel"
                          placeholder="Civic, Corolla, etc."
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Ano</Label>
                        <Input
                          id="vehicleYear"
                          placeholder="2020"
                          value={formData.vehicleYear}
                          onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehiclePlate">Placa *</Label>
                        <Input
                          id="vehiclePlate"
                          placeholder="ABC-1234"
                          value={formData.vehiclePlate}
                          onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleColor">Cor</Label>
                        <Input
                          id="vehicleColor"
                          placeholder="Branco, Prata, etc."
                          value={formData.vehicleColor}
                          onChange={(e) => setFormData({...formData, vehicleColor: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full gradient-viaja text-white"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : `Cadastrar como ${userType === 'patient' ? 'Paciente' : 'Motorista'}`}
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
