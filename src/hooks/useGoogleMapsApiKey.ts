
import { useState, useEffect } from 'react';

export const useGoogleMapsApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('google_maps_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
  }, []);

  const updateApiKey = (newKey: string) => {
    setApiKey(newKey);
    setIsConfigured(true);
    // Atualizar todos os scripts do Google Maps carregados
    updateGoogleMapsScripts(newKey);
  };

  const clearApiKey = () => {
    localStorage.removeItem('google_maps_api_key');
    setApiKey(null);
    setIsConfigured(false);
  };

  return {
    apiKey,
    isConfigured,
    updateApiKey,
    clearApiKey,
  };
};

// Função para atualizar scripts existentes com nova chave
const updateGoogleMapsScripts = (newKey: string) => {
  const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  existingScripts.forEach(script => {
    script.remove();
  });
  
  // Limpar instâncias globais do Google Maps
  if (window.google) {
    delete (window as any).google;
  }
};
