
import React, { useState } from 'react';
import { User, Camera, Save, MapPin, Star, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DriverHeader from '@/components/driver/DriverHeader';
import { toast } from 'sonner';

const DriverProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '+55 11 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    bio: 'Motorista profissional há 5 anos, sempre pontual e atencioso.',
    rating: 4.9,
    totalRides: 324,
    memberSince: '2022'
  });

  const driverData = {
    name: profile.name,
    email: profile.email,
    rating: profile.rating,
    totalRides: profile.totalRides,
    memberSince: profile.memberSince,
    vehicle: 'Honda Civic 2020',
    plate: 'ABC-1234'
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driver={driverData} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 bg-viaja-green rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{profile.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{profile.totalRides} corridas</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Desde {profile.memberSince}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "secondary" : "default"}
                >
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Sobre você</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <h3 className="font-semibold text-lg">{profile.rating}</h3>
                <p className="text-gray-600">Avaliação Média</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-viaja-blue" />
                <h3 className="font-semibold text-lg">{profile.totalRides}</h3>
                <p className="text-gray-600">Total de Corridas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-viaja-green" />
                <h3 className="font-semibold text-lg">{new Date().getFullYear() - parseInt(profile.memberSince)}</h3>
                <p className="text-gray-600">Anos na Plataforma</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
