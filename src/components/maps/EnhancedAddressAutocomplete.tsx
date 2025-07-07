
import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface EnhancedAddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onPlaceSelect?: (place: { description: string; placeId: string; coordinates?: { lat: number; lng: number } }) => void
  showCurrentLocationButton?: boolean
}

declare global {
  interface Window {
    google: any
  }
}

const EnhancedAddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Digite um endereço...",
  className = "",
  onPlaceSelect,
  showCurrentLocationButton = true
}: EnhancedAddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)

  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
    }
  }, [])

  useEffect(() => {
    if (!autocompleteService.current || value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    
    const request = {
      input: value,
      componentRestrictions: { country: 'br' },
      types: ['address', 'establishment', 'geocode']
    }

    autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
      setLoading(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    })
  }, [value])

  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
    
    // Obter coordenadas do local selecionado
    if (placesService.current) {
      placesService.current.getDetails({
        placeId: suggestion.place_id,
        fields: ['geometry']
      }, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
          
          onPlaceSelect?.({
            description: suggestion.description,
            placeId: suggestion.place_id,
            coordinates
          })
        } else {
          onPlaceSelect?.({
            description: suggestion.description,
            placeId: suggestion.place_id
          })
        }
      })
    } else {
      onPlaceSelect?.({
        description: suggestion.description,
        placeId: suggestion.place_id
      })
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador')
      return
    }

    setGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Fazer geocodificação reversa para obter o endereço
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder()
          
          geocoder.geocode({
            location: { lat: latitude, lng: longitude }
          }, (results: any[], status: any) => {
            setGettingLocation(false)
            
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address
              onChange(address)
              
              onPlaceSelect?.({
                description: address,
                placeId: results[0].place_id,
                coordinates: { lat: latitude, lng: longitude }
              })
            } else {
              onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
              onPlaceSelect?.({
                description: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                placeId: '',
                coordinates: { lat: latitude, lng: longitude }
              })
            }
          })
        } else {
          setGettingLocation(false)
          onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          onPlaceSelect?.({
            description: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            placeId: '',
            coordinates: { lat: latitude, lng: longitude }
          })
        }
      },
      (error) => {
        setGettingLocation(false)
        console.error('Erro ao obter localização:', error)
        alert('Não foi possível obter sua localização atual')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          )}
        </div>
        
        {showCurrentLocationButton && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-2 shrink-0"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Button
              key={suggestion.place_id || index}
              variant="ghost"
              className="w-full justify-start text-left p-3 hover:bg-gray-50 rounded-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default EnhancedAddressAutocomplete
