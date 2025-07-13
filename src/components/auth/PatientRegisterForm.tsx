
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { Upload, User } from 'lucide-react';

const PatientRegisterForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    sus_card: '',
    has_dependency: false,
    dependency_description: ''
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.cpf || 
        !formData.password || !formData.sus_card) {
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

    if (formData.has_dependency && !formData.dependency_description) {
      toast.error('Descreva a dependência');
      return;
    }

    setLoading(true);

    try {
      // Cadastrar usuário
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        user_type: 'patient'
      });
      
      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
        return;
      }

      if (data?.user) {
        // Upload da foto do perfil
        let profilePhotoUrl = '';
        if (profilePhoto) {
          profilePhotoUrl = await uploadFile(profilePhoto, 'profile-photo') || '';
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
            user_type: 'patient',
            profile_photo: profilePhotoUrl
          });

        if (profileError) throw profileError;

        // Criar dados específicos do paciente
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            id: data.user.id,
            sus_card: formData.sus_card,
            has_dependency: formData.has_dependency,
            dependency_description: formData.dependency_description || null
          });

        if (patientError) throw patientError;

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-gradient-viaja rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl gradient-viaja bg-clip-text text-transparent">
          Cadastro de Paciente
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
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

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
            <Label htmlFor="sus_card">Cartão SUS *</Label>
            <Input
              id="sus_card"
              type="text"
              value={formData.sus_card}
              onChange={(e) => setFormData({...formData, sus_card: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="has_dependency"
                checked={formData.has_dependency}
                onCheckedChange={(checked) => setFormData({...formData, has_dependency: checked as boolean})}
              />
              <Label htmlFor="has_dependency">Possui alguma dependência</Label>
            </div>
          </div>

          {formData.has_dependency && (
            <div className="space-y-2">
              <Label htmlFor="dependency_description">Descreva a dependência *</Label>
              <Textarea
                id="dependency_description"
                value={formData.dependency_description}
                onChange={(e) => setFormData({...formData, dependency_description: e.target.value})}
                placeholder="Descreva detalhadamente a dependência..."
              />
            </div>
          )}

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
          
          <Button 
            type="submit" 
            className="w-full gradient-viaja text-white"
            disabled={loading || uploading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar como Paciente'}
          </Button>
          
          <div className="text-center space-y-2">
            <Link to="/auth/register/driver" className="text-sm text-viaja-blue hover:underline">
              Sou motorista
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

export default PatientRegisterForm;
