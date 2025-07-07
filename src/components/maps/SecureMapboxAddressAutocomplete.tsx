
import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMapboxApi } from '@/hooks/useMapboxApi'

interface SecureMapboxAddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onPlaceSelect?: (place: { description: string; coordinates?: { lat: number; lng: number } }) => void
  showCurrentLocationButton?: boolean
}

const SecureMapboxAddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Digite um endereço...",
  className = "",
  onPlaceSelect,
  showCurrentLocationButton = true
}: SecureMapboxAddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const { searchPlaces, reverseGeocode, loading } = useMapboxApi()

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await searchPlaces(value)
        
        if (data.features) {
          setSuggestions(data.features)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error('Erro na busca de endereços:', error)
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 500)

    setSearchTimeout(timeout)

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout)
    }
  }, [value, searchPlaces])

  const handleSuggestionClick = (suggestion: any) => {
    const address = suggestion.place_name || suggestion.text
    onChange(address)
    setSuggestions([])
    setShowSuggestions(false)
    
    const coordinates = {
      lng: suggestion.center[0],
      lat: suggestion.center[1]
    }
    
    onPlaceSelect?.({
      description: address,
      coordinates
    })
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
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const data = await reverseGeocode(latitude, longitude)
          
          if (data.features && data.features[0]) {
            const address = data.features[0].place_name
            onChange(address)
            
            onPlaceSelect?.({
              description: address,
              coordinates: { lat: latitude, lng: longitude }
            })
          } else {
            onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
            onPlaceSelect?.({
              description: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              coordinates: { lat: latitude, lng: longitude }
            })
          }
        } catch (error) {
          console.error('Erro na geocodificação reversa:', error)
          onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          onPlaceSelect?.({
            description: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude }
          })
        }
        setGettingLocation(false)
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
              key={suggestion.id || index}
              variant="ghost"
              className="w-full justify-start text-left p-3 hover:bg-gray-50 rounded-none border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {suggestion.text}
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {suggestion.place_name}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SecureMapboxAddressAutocomplete
