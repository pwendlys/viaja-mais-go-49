
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, CheckCircle } from 'lucide-react';

interface GoogleMapsConfigProps {
  onApiKeySet: (apiKey: string) => void;
}

const GoogleMapsConfig = ({ onApiKeySet }: GoogleMapsConfigProps) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Carregar chave salva do localStorage
    const saved = localStorage.getItem('google_maps_api_key');
    if (saved) {
      setSavedKey(saved);
      onApiKeySet(saved);
    }
  }, [onApiKeySet]);

  const validateAndSaveKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    
    try {
      // Validação básica da chave
      if (apiKey.startsWith('AIza') && apiKey.length > 30) {
        localStorage.setItem('google_maps_api_key', apiKey);
        setSavedKey(apiKey);
        onApiKeySet(apiKey);
        setApiKey('');
      } else {
        throw new Error('Formato de chave inválido');
      }
    } catch (error) {
      console.error('Erro ao validar chave da API:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const clearKey = () => {
    localStorage.removeItem('google_maps_api_key');
    setSavedKey('');
    setApiKey('');
  };

  if (savedKey) {
    return (
      <Alert className="mb-4">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Chave da API do Google Maps configurada</span>
          <Button variant="outline" size="sm" onClick={clearKey}>
            Alterar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>Configurar Google Maps API</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Cole sua chave da API do Google Maps"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button 
            onClick={validateAndSaveKey}
            disabled={!apiKey.trim() || isValidating}
            className="w-full"
          >
            {isValidating ? 'Validando...' : 'Salvar Chave'}
          </Button>
        </div>
        
        <Alert>
          <AlertDescription>
            <strong>Como obter sua chave:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Acesse o Google Cloud Console</li>
              <li>Crie ou selecione um projeto</li>
              <li>Ative as APIs: Maps JavaScript, Places, Directions, Geocoding</li>
              <li>Vá em "Credenciais" e crie uma nova chave de API</li>
              <li>Configure as restrições de segurança</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsConfig;
