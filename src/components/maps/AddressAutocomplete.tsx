
import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onPlaceSelect?: (place: { description: string; placeId: string }) => void
}

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Digite um endereço...",
  className = "",
  onPlaceSelect
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchPlaces, loading } = useGoogleMaps()

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (value.length > 2) {
      const timeout = setTimeout(async () => {
        const results = await searchPlaces(value)
        setSuggestions(results)
        setShowSuggestions(true)
      }, 500)
      setSearchTimeout(timeout)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout)
    }
  }, [value, searchPlaces])

  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
    onPlaceSelect?.({
      description: suggestion.description,
      placeId: suggestion.place_id
    })
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleInputBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
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
              <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div className="text-sm text-gray-500 truncate">
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

export default AddressAutocomplete
