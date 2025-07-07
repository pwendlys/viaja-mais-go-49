
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, CheckCircle, ExternalLink } from 'lucide-react';

interface GoogleMapsConfigProps {
  onApiKeySet: (apiKey: string) => void;
}

const GoogleMapsConfig = ({ onApiKeySet }: GoogleMapsConfigProps) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Carregar chave salva do localStorage
    let saved = localStorage.getItem('google_maps_api_key');
    const defaultKey = 'AIzaSyC1RTNnAuPOxerNlXqZfIXPYFHdmRg3qow';
    
    // Se não há chave salva, usar a chave padrão
    if (!saved || saved === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      saved = defaultKey;
      localStorage.setItem('google_maps_api_key', defaultKey);
    }
    
    setSavedKey(saved);
    onApiKeySet(saved);
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
    // Recarregar a página para limpar o estado do Google Maps
    window.location.reload();
  };

  if (savedKey && savedKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-green-800">
            ✅ Chave da API do Google Maps configurada com sucesso!
          </span>
          <Button variant="outline" size="sm" onClick={clearKey}>
            Alterar Chave
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Key className="h-5 w-5" />
          <span>Configure sua Chave da API do Google Maps</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Cole sua chave da API do Google Maps aqui (ex: AIzaSy...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
          <Button 
            onClick={validateAndSaveKey}
            disabled={!apiKey.trim() || isValidating}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {isValidating ? 'Validando...' : '🔑 Salvar e Ativar Chave'}
          </Button>
        </div>
        
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <strong>Como obter sua chave da API:</strong>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-6">
                <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                <li>Crie um novo projeto ou selecione um existente</li>
                <li>Ative estas APIs:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Maps JavaScript API</li>
                    <li>Places API</li>
                    <li>Directions API</li>
                    <li>Geocoding API</li>
                  </ul>
                </li>
                <li>Vá em "Credenciais" → "Criar credenciais" → "Chave de API"</li>
                <li>Configure as restrições de segurança (opcional)</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsConfig;
