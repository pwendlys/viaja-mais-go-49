
import { useEffect, useState } from 'react';

interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

interface Location {
  lat: number;
  lng: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
}

export const useGoogleMaps = (config: GoogleMapsConfig) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se já existe uma instância carregada
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Verificar se a chave é válida
    if (!config.apiKey || config.apiKey === 'YOUR_API_KEY_HERE') {
      setLoadError('Chave da API do Google Maps não configurada');
      return;
    }

    // Limpar erro anterior
    setLoadError(null);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${config.libraries.join(',')}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Callback global para quando o script carregar
    (window as any).initGoogleMaps = () => {
      setIsLoaded(true);
      delete (window as any).initGoogleMaps;
    };
    
    script.onerror = () => {
      setLoadError('Erro ao carregar Google Maps API. Verifique sua chave de API.');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, [config.apiKey, config.libraries]);

  const calculateRoute = async (origin: Location, destination: Location): Promise<RouteInfo | null> => {
    if (!isLoaded || !window.google) {
      console.warn('Google Maps não está carregado');
      return null;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route({
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Erro no cálculo da rota: ${status}`));
          }
        });
      });

      const route = result.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance?.text || '',
        duration: leg.duration?.text || '',
        distanceValue: leg.distance?.value || 0,
        durationValue: leg.duration?.value || 0,
      };
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      return null;
    }
  };

  const geocodeAddress = async (address: string): Promise<Location | null> => {
    if (!isLoaded || !window.google) {
      console.warn('Google Maps não está carregado');
      return null;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Erro na geocodificação: ${status}`));
          }
        });
      });

      const location = result[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
      };
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
      return null;
    }
  };

  return {
    isLoaded,
    loadError,
    calculateRoute,
    geocodeAddress,
  };
};
