
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Navigation, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMapboxApi } from '@/hooks/useMapboxApi';
import { toast } from 'sonner';
import FavoriteLocationModal from './FavoriteLocationModal';

interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface LocationAwareAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
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
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const { searchPlaces, reverseGeocode } = useMapboxApi();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteLocations') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search suggestions with debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length < 3) {
      // Show favorites when input is empty and it's destination field
      if (isDestination && value.length === 0 && favorites.length > 0) {
        const favoriteSuggestions = favorites.map((fav, index) => ({
          id: `favorite-${index}`,
          place_name: `${fav.name} - ${fav.address}`,
          center: [fav.lng, fav.lat] as [number, number],
          isFavorite: true
        }));
        setSuggestions(favoriteSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await searchPlaces(value, { lat: -21.7554, lng: -43.3636 });
        
        if (response?.features) {
          const uniqueSuggestions = response.features.reduce((acc: AddressSuggestion[], feature: any) => {
            const exists = acc.find(item => item.place_name === feature.place_name);
            if (!exists) {
              acc.push({
                id: feature.id,
                place_name: feature.place_name,
                center: feature.center
              });
            }
            return acc;
          }, []);
          
          setSuggestions(uniqueSuggestions.slice(0, 5));
          setShowSuggestions(uniqueSuggestions.length > 0);
        }
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        toast.error('Erro ao buscar endereços');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, searchPlaces, favorites, isDestination]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const location = {
      lat: suggestion.center[1],
      lng: suggestion.center[0],
      address: suggestion.place_name
    };

    onChange(suggestion.place_name);
    onLocationSelect(location);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);

    // If it's destination and not a favorite, show option to save as favorite
    if (isDestination && !(suggestion as any).isFavorite) {
      setSelectedLocation(location);
      setShowFavoriteModal(true);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada neste navegador');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await reverseGeocode(latitude, longitude);
          
          if (response?.features && response.features[0]) {
            const address = response.features[0].place_name;
            onChange(address);
            onLocationSelect({
              lat: latitude,
              lng: longitude,
              address: address
            });
            toast.success('Localização atual obtida com sucesso!');
          }
        } catch (error) {
          console.error('Erro ao obter endereço:', error);
          toast.error('Erro ao obter endereço da localização atual');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        toast.error('Erro ao obter localização atual');
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (isDestination && value.length === 0 && favorites.length > 0) {
                const favoriteSuggestions = favorites.map((fav, index) => ({
                  id: `favorite-${index}`,
                  place_name: `${fav.name} - ${fav.address}`,
                  center: [fav.lng, fav.lat] as [number, number],
                  isFavorite: true
                }));
                setSuggestions(favoriteSuggestions);
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="pl-10 pr-20"
            autoComplete="off"
          />
          
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {showCurrentLocation && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                title="Usar localização atual"
              >
                <Navigation className={`h-4 w-4 ${gettingLocation ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={clearInput}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {(suggestion as any).isFavorite ? (
                  <Heart className="h-4 w-4 text-viaja-blue flex-shrink-0" />
                ) : (
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-800 truncate">
                  {suggestion.place_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <FavoriteLocationModal
        isOpen={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        location={selectedLocation}
      />
    </>
  );
};

export default LocationAwareAutocomplete;
