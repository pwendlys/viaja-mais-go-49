
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Home, Briefcase, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface FavoriteLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
}

const FavoriteLocationModal = ({ isOpen, onClose, location }: FavoriteLocationModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'hospital' | 'home' | 'work' | 'other'>('home');
  const [saving, setSaving] = useState(false);

  const typeOptions = [
    { value: 'home', label: 'Minha Casa', icon: Home },
    { value: 'work', label: 'Trabalho', icon: Briefcase },
    { value: 'hospital', label: 'Hospital', icon: Heart },
    { value: 'other', label: 'Outro', icon: MapPin }
  ];

  const handleSave = async () => {
    if (!location || !name.trim()) {
      toast.error('Por favor, preencha o nome do local');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para salvar favoritos');
        return;
      }

      // Save to localStorage for now (in a real app, save to database)
      const favorites = JSON.parse(localStorage.getItem('favoriteLocations') || '[]');
      const newFavorite = {
        id: Date.now().toString(),
        userId: user.id,
        name: name.trim(),
        type,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        createdAt: new Date().toISOString()
      };

      favorites.push(newFavorite);
      localStorage.setItem('favoriteLocations', JSON.stringify(favorites));

      toast.success('Local salvo nos favoritos!');
      setName('');
      setType('home');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
      toast.error('Erro ao salvar favorito');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('home');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-viaja-blue" />
            <span>Salvar como Favorito</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Endereço:</p>
            <p className="text-sm font-medium">{location?.address}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="favorite-name">Nome do Local</Label>
            <Input
              id="favorite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Casa da Vovó, Hospital do Coração..."
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label>Tipo de Local</Label>
            <RadioGroup value={type} onValueChange={(value: any) => setType(value)}>
              {typeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <label 
                      htmlFor={option.value}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 gradient-viaja text-white"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar Favorito'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FavoriteLocationModal;
