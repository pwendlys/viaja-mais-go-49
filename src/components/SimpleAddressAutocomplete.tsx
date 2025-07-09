
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface SimpleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: Location) => void;
  placeholder?: string;
  className?: string;
  showCurrentLocation?: boolean;
  isDestination?: boolean;
}

const SimpleAddressAutocomplete = ({ 
  value, 
  onChange, 
  onLocationSelect,
  placeholder = "Digite o endereço...",
  className = "",
  showCurrentLocation = false,
  isDestination = false
}: SimpleAddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Função para buscar sugestões (simulada - você pode integrar com uma API real)
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Simulação de API - substitua por uma chamada real
    try {
      // Aqui você pode integrar com Google Maps, Mapbox ou outra API
      const mockSuggestions = [
        {
          description: `${query} - Centro, Juiz de Fora - MG`,
          coordinates: { lat: -21.7554, lng: -43.3636 }
        },
        {
          description: `${query} - Zona Norte, Juiz de Fora - MG`,
          coordinates: { lat: -21.7400, lng: -43.3500 }
        },
        {
          description: `${query} - Zona Sul, Juiz de Fora - MG`,
          coordinates: { lat: -21.7700, lng: -43.3700 }
        }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para evitar muitas requisições
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    
    if (onLocationSelect && suggestion.coordinates) {
      onLocationSelect({
        lat: suggestion.coordinates.lat,
        lng: suggestion.coordinates.lng,
        address: suggestion.description
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocationText = `Minha localização atual (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
          onChange(currentLocationText);
          
          if (onLocationSelect) {
            onLocationSelect({
              lat: latitude,
              lng: longitude,
              address: currentLocationText
            });
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay para permitir click nas sugestões
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className="pr-10"
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {showCurrentLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="shrink-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleAddressAutocomplete;
