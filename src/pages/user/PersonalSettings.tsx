
import React, { useState } from 'react';
import { User, Phone, MapPin, Heart, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserHeader from '@/components/user/UserHeader';
import { toast } from 'sonner';

const PersonalSettings = () => {
  const [personalData, setPersonalData] = useState({
    fullName: 'Maria Silva',
    phone: '(32) 99999-9999',
    address: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'Juiz de Fora',
    state: 'MG',
    susNumber: '123456789012345',
    medicalCondition: '',
    mobilityNeeds: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const userData = {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    rating: 4.8,
    totalTrips: 47,
    memberSince: '2023'
  };

  const handleSave = () => {
    // Aqui seria feita a chamada para salvar os dados no banco
    toast.success('Dados pessoais atualizados com sucesso!');
  };

  const handleInputChange = (field: string, value: string) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Configurações Pessoais</h1>
            <Button className="gradient-viaja text-white" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Dados Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={personalData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={personalData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="susNumber">Número do SUS</Label>
                  <Input
                    id="susNumber"
                    value={personalData.susNumber}
                    onChange={(e) => handleInputChange('susNumber', e.target.value)}
                    placeholder="Digite seu número do SUS"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Endereço</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={personalData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={personalData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={personalData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Informações Médicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalCondition">Condições Médicas</Label>
                <Textarea
                  id="medicalCondition"
                  value={personalData.medicalCondition}
                  onChange={(e) => handleInputChange('medicalCondition', e.target.value)}
                  placeholder="Descreva suas condições médicas relevantes..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobilityNeeds">Necessidades de Mobilidade</Label>
                <Select value={personalData.mobilityNeeds} onValueChange={(value) => handleInputChange('mobilityNeeds', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione suas necessidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma necessidade especial</SelectItem>
                    <SelectItem value="wheelchair">Cadeira de rodas</SelectItem>
                    <SelectItem value="walker">Andador</SelectItem>
                    <SelectItem value="crutches">Muletas</SelectItem>
                    <SelectItem value="assistance">Auxílio para caminhar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Contato de Emergência</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Nome do Contato</Label>
                  <Input
                    id="emergencyContactName"
                    value={personalData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Telefone do Contato</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={personalData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transportation Notice */}
          <Card className="bg-gradient-viaja-subtle border-viaja-blue/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-viaja-blue mb-2">🚗 Transporte Municipal Gratuito</h3>
                <p className="text-sm text-gray-700">
                  Este serviço é oferecido gratuitamente pela Prefeitura de Juiz de Fora para facilitar 
                  o acesso aos serviços de saúde. Não há cobrança pelos trajetos realizados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalSettings;
