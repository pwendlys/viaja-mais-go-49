
import { useState, useEffect } from 'react';

export const useGoogleMapsApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForSavedKey = () => {
      const savedKey = localStorage.getItem('google_maps_api_key');
      if (savedKey && savedKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        setApiKey(savedKey);
        setIsConfigured(true);
      }
      setIsLoading(false);
    };

    checkForSavedKey();
  }, []);

  const updateApiKey = (newKey: string) => {
    if (newKey && newKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      localStorage.setItem('google_maps_api_key', newKey);
      setApiKey(newKey);
      setIsConfigured(true);
      
      // Limpar instâncias antigas do Google Maps
      updateGoogleMapsScripts(newKey);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('google_maps_api_key');
    setApiKey(null);
    setIsConfigured(false);
    
    // Limpar scripts do Google Maps
    cleanupGoogleMapsScripts();
  };

  return {
    apiKey,
    isConfigured,
    isLoading,
    updateApiKey,
    clearApiKey,
  };
};

// Função para limpar scripts existentes com nova chave
const updateGoogleMapsScripts = (newKey: string) => {
  cleanupGoogleMapsScripts();
};

// Função para limpar todos os scripts do Google Maps
const cleanupGoogleMapsScripts = () => {
  const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  existingScripts.forEach(script => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  });
  
  // Limpar instâncias globais do Google Maps
  if (window.google) {
    delete (window as any).google;
  }
  
  // Limpar callback global se existir
  if ((window as any).initGoogleMaps) {
    delete (window as any).initGoogleMaps;
  }
};
