
import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Heart, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserHeader from '@/components/user/UserHeader';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { healthTransportApi } from '@/services/healthTransportApi';
import { supabase } from '@/integrations/supabase/client';

const PersonalSettings = () => {
  const { userProfile, loading, refetch } = useUserProfile();
  const [saving, setSaving] = useState(false);
  
  const [personalData, setPersonalData] = useState({
    fullName: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    susNumber: '',
    medicalCondition: '',
    mobilityNeeds: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  // Atualizar dados quando o perfil do usuário for carregado
  useEffect(() => {
    if (userProfile) {
      setPersonalData({
        fullName: userProfile.profile.full_name || '',
        phone: userProfile.profile.phone || '',
        address: userProfile.patientData?.address || '',
        neighborhood: userProfile.patientData?.neighborhood || '',
        city: userProfile.patientData?.city || '',
        state: userProfile.patientData?.state || '',
        susNumber: userProfile.patientData?.sus_number || '',
        medicalCondition: userProfile.patientData?.medical_condition || '',
        mobilityNeeds: userProfile.patientData?.mobility_needs || '',
        emergencyContactName: userProfile.patientData?.emergency_contact_name || '',
        emergencyContactPhone: userProfile.patientData?.emergency_contact_phone || ''
      });
    }
  }, [userProfile]);

  const userData = userProfile ? {
    name: userProfile.profile.full_name,
    email: '', // Email vem do auth, se necessário pode ser buscado
    rating: userProfile.stats.rating || 0,
    totalTrips: userProfile.stats.totalTrips,
    memberSince: new Date(userProfile.profile.created_at).getFullYear().toString()
  } : {
    name: '',
    email: '',
    rating: 0,
    totalTrips: 0,
    memberSince: ''
  };

  const handleSave = async () => {
    if (!userProfile) return;
    
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      // Atualizar dados do perfil
      const profileData = {
        full_name: personalData.fullName,
        phone: personalData.phone
      };

      // Atualizar dados específicos do paciente
      const patientData = {
        address: personalData.address,
        neighborhood: personalData.neighborhood,
        city: personalData.city,
        state: personalData.state,
        sus_number: personalData.susNumber,
        medical_condition: personalData.medicalCondition,
        mobility_needs: personalData.mobilityNeeds,
        emergency_contact_name: personalData.emergencyContactName,
        emergency_contact_phone: personalData.emergencyContactPhone
      };

      // Usar a API para atualizar o perfil
      await healthTransportApi.completeProfile(
        user.id,
        'patient',
        profileData,
        patientData
      );

      toast.success('Dados pessoais atualizados com sucesso!');
      
      // Recarregar os dados do perfil
      await refetch();
      
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viaja-blue mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Configurações Pessoais</h1>
            <Button 
              className="gradient-viaja text-white" 
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
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
