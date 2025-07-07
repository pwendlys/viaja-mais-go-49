
import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { address: string; location: { lat: number; lng: number } }) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Digite um endereço",
  className = "",
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  const { isLoaded } = useGoogleMaps({
    apiKey: 'YOUR_API_KEY_HERE', // Será substituído pela chave real
    libraries: ['places'],
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocomplete || !window.google) return;

    const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'BR' },
      fields: ['formatted_address', 'geometry'],
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (place.formatted_address && place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        onChange(place.formatted_address);
        onPlaceSelect({
          address: place.formatted_address,
          location,
        });
      }
    });

    setAutocomplete(autocompleteInstance);
  }, [isLoaded, onChange, onPlaceSelect, autocomplete]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default AddressAutocomplete;
