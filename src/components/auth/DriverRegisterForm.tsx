
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { Car, Upload } from 'lucide-react';

const DriverRegisterForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [loading, setLoading] = useState(false);
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [cnhFrontPhoto, setCnhFrontPhoto] = useState<File | null>(null);
  const [cnhBackPhoto, setCnhBackPhoto] = useState<File | null>(null);
  const [vehicleDocument, setVehicleDocument] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    cnh_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_color: '',
    vehicle_plate: ''
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      switch (type) {
        case 'profile':
          setProfilePhoto(file);
          const reader = new FileReader();
          reader.onload = (e) => setProfilePhotoPreview(e.target?.result as string);
          reader.readAsDataURL(file);
          break;
        case 'cnh-front':
          setCnhFrontPhoto(file);
          break;
        case 'cnh-back':
          setCnhBackPhoto(file);
          break;
        case 'vehicle-document':
          setVehicleDocument(file);
          break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.cpf || 
        !formData.password || !formData.cnh_number || !formData.vehicle_make || 
        !formData.vehicle_model || !formData.vehicle_year || !formData.vehicle_color || 
        !formData.vehicle_plate) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!cnhFrontPhoto || !cnhBackPhoto) {
      toast.error('Por favor, envie as fotos da CNH (frente e verso)');
      return;
    }

    setLoading(true);

    try {
      // Cadastrar usuário
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        user_type: 'driver'
      });
      
      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
        return;
      }

      if (data?.user) {
        // Upload dos arquivos
        let profilePhotoUrl = '';
        let cnhFrontUrl = '';
        let cnhBackUrl = '';
        let vehicleDocumentUrl = '';

        if (profilePhoto) {
          profilePhotoUrl = await uploadFile(profilePhoto, 'profile-photo') || '';
        }
        
        if (cnhFrontPhoto) {
          cnhFrontUrl = await uploadFile(cnhFrontPhoto, 'cnh-front') || '';
        }
        
        if (cnhBackPhoto) {
          cnhBackUrl = await uploadFile(cnhBackPhoto, 'cnh-back') || '';
        }
        
        if (vehicleDocument) {
          vehicleDocumentUrl = await uploadFile(vehicleDocument, 'vehicle-document') || '';
        }

        // Criar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            user_type: 'driver',
            profile_photo: profilePhotoUrl
          });

        if (profileError) throw profileError;

        // Criar dados específicos do motorista
        const { error: driverError } = await supabase
          .from('drivers')
          .insert({
            id: data.user.id,
            cnh_number: formData.cnh_number,
            cnh_front_photo: cnhFrontUrl,
            cnh_back_photo: cnhBackUrl,
            vehicle_document: vehicleDocumentUrl,
            vehicle_make: formData.vehicle_make,
            vehicle_model: formData.vehicle_model,
            vehicle_year: parseInt(formData.vehicle_year),
            vehicle_color: formData.vehicle_color,
            vehicle_plate: formData.vehicle_plate
          });

        if (driverError) throw driverError;

        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro inesperado ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-gradient-viaja rounded-full flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl gradient-viaja bg-clip-text text-transparent">
          Cadastro de Motorista
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto do Perfil */}
          <div className="space-y-2">
            <Label>Foto do Perfil</Label>
            <div className="flex items-center space-x-4">
              {profilePhotoPreview && (
                <img 
                  src={profilePhotoPreview} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e, 'profile')}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Celular *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnh_number">Número da CNH *</Label>
              <Input
                id="cnh_number"
                type="text"
                value={formData.cnh_number}
                onChange={(e) => setFormData({...formData, cnh_number: e.target.value})}
                required
              />
            </div>
          </div>

          {/* CNH Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNH - Frente *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'cnh-front')}
                className="cursor-pointer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>CNH - Verso *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'cnh-back')}
                className="cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Vehicle Document */}
          <div className="space-y-2">
            <Label>Documento do Veículo</Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handlePhotoChange(e, 'vehicle-document')}
              className="cursor-pointer"
            />
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_make">Marca do Veículo *</Label>
              <Input
                id="vehicle_make"
                type="text"
                value={formData.vehicle_make}
                onChange={(e) => setFormData({...formData, vehicle_make: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Modelo do Veículo *</Label>
              <Input
                id="vehicle_model"
                type="text"
                value={formData.vehicle_model}
                onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_year">Ano do Veículo *</Label>
              <Input
                id="vehicle_year"
                type="number"
                min="1990"
                max="2025"
                value={formData.vehicle_year}
                onChange={(e) => setFormData({...formData, vehicle_year: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_color">Cor do Veículo *</Label>
              <Input
                id="vehicle_color"
                type="text"
                value={formData.vehicle_color}
                onChange={(e) => setFormData({...formData, vehicle_color: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vehicle_plate">Placa do Veículo *</Label>
              <Input
                id="vehicle_plate"
                type="text"
                placeholder="ABC-1234"
                value={formData.vehicle_plate}
                onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full gradient-viaja text-white"
            disabled={loading || uploading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar como Motorista'}
          </Button>
          
          <div className="text-center space-y-2">
            <Link to="/auth/register/patient" className="text-sm text-viaja-blue hover:underline">
              Sou paciente
            </Link>
            <br />
            <Link to="/login" className="text-sm text-viaja-blue hover:underline">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverRegisterForm;
