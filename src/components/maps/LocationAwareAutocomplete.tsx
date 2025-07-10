
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMapboxApi } from '@/hooks/useMapboxApi';
import { toast } from 'sonner';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationAwareAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: Location) => void;
  placeholder?: string;
  className?: string;
  showCurrentLocation?: boolean;
  isDestination?: boolean;
}

const LocationAwareAutocomplete = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Digite um endereço...",
  className = "",
  showCurrentLocation = false,
  isDestination = false
}: LocationAwareAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Use refs to prevent infinite re-renders
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastQueryRef = useRef<string>('');
  
  const { searchPlaces, reverseGeocode } = useMapboxApi();

  // Memoized function to search places
  const searchWithDebounce = useCallback(async (query: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search for empty or very short queries
    if (!query || query.length < 3 || query === lastQueryRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    lastQueryRef.current = query;

    timeoutRef.current = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        const results = await searchPlaces(query);
        
        if (Array.isArray(results)) {
          setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error searching places:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        toast.error('Erro ao buscar endereços');
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500); // 500ms debounce
  }, [searchPlaces]);

  // Handle input change with debounced search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= 3) {
      searchWithDebounce(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onChange, searchWithDebounce]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    if (suggestion && suggestion.place_name) {
      onChange(suggestion.place_name);
      
      if (onLocationSelect && suggestion.center) {
        const location: Location = {
          lat: suggestion.center[1],
          lng: suggestion.center[0],
          address: suggestion.place_name
        };
        onLocationSelect(location);
      }
      
      setSuggestions([]);
      setShowSuggestions(false);
      lastQueryRef.current = suggestion.place_name;
    }
  }, [onChange, onLocationSelect]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo navegador');
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      try {
        const address = await reverseGeocode(latitude, longitude);
        
        if (address) {
          onChange(address);
          
          if (onLocationSelect) {
            const location: Location = {
              lat: latitude,
              lng: longitude,
              address: address
            };
            onLocationSelect(location);
          }
          
          toast.success('Localização atual obtida com sucesso');
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding error:', geocodeError);
        toast.error('Erro ao obter endereço da localização');
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      let errorMessage = 'Erro ao obter localização';
      if (error.code === 1) {
        errorMessage = 'Permissão de localização negada';
      } else if (error.code === 2) {
        errorMessage = 'Localização indisponível';
      } else if (error.code === 3) {
        errorMessage = 'Timeout ao obter localização';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  }, [onChange, onLocationSelect, reverseGeocode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pr-10"
            autoComplete="off"
          />
          
          {isLoadingSuggestions && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          
          {!isLoadingSuggestions && value && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
        
        {showCurrentLocation && !isDestination && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="px-3"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.id || index}`}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.text || suggestion.place_name}
                  </p>
                  {suggestion.place_name !== suggestion.text && (
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.place_name}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAwareAutocomplete;
