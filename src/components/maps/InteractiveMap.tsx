
import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Loader2, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'

interface Driver {
  id: string
  name: string
  lat: number
  lng: number
  rating: number
  eta: string
}

interface InteractiveMapProps {
  drivers?: Driver[]
  origin?: { lat: number; lng: number; address?: string }
  destination?: { lat: number; lng: number; address?: string }
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  className?: string
}

const InteractiveMap = ({ 
  drivers = [], 
  origin, 
  destination, 
  onLocationSelect,
  className = ""
}: InteractiveMapProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }) // São Paulo default
  const [zoom, setZoom] = useState(15)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const { reverseGeocode } = useGoogleMaps()

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      setLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
          setLoadingLocation(false)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setLoadingLocation(false)
        }
      )
    }
  }, [])

  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onLocationSelect) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Simple coordinate conversion (this would be more precise with actual map library)
    const lat = mapCenter.lat + (rect.height / 2 - y) * 0.001
    const lng = mapCenter.lng + (x - rect.width / 2) * 0.001
    
    onLocationSelect({ lat, lng })
  }

  const centerOnUserLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
          setLoadingLocation(false)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setLoadingLocation(false)
        }
      )
    }
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div 
        className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 cursor-pointer relative"
        onClick={handleMapClick}
      >
        {/* Map background with grid pattern */}
        <div className="absolute inset-0 bg-gray-100 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-green-100/30"></div>
          {/* Grid pattern to simulate map */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`v-${i}`} className="absolute border-gray-300" style={{
                left: `${i * 5}%`,
                top: 0,
                bottom: 0,
                borderLeft: '1px solid currentColor'
              }} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={`h-${i}`} className="absolute border-gray-300" style={{
                top: `${i * 6.67}%`,
                left: 0,
                right: 0,
                borderTop: '1px solid currentColor'
              }} />
            ))}
          </div>
        </div>

        {/* User location */}
        {userLocation && (
          <div 
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: '50%', 
              top: '50%' 
            }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full opacity-30 animate-ping"></div>
            </div>
          </div>
        )}

        {/* Origin marker */}
        {origin && (
          <div 
            className="absolute z-10 transform -translate-x-1/2 -translate-y-full"
            style={{ 
              left: '40%', 
              top: '70%' 
            }}
          >
            <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            {origin.address && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                {origin.address}
              </div>
            )}
          </div>
        )}

        {/* Destination marker */}
        {destination && (
          <div 
            className="absolute z-10 transform -translate-x-1/2 -translate-y-full"
            style={{ 
              left: '70%', 
              top: '30%' 
            }}
          >
            <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            {destination.address && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                {destination.address}
              </div>
            )}
          </div>
        )}

        {/* Drivers */}
        {drivers.map((driver, index) => (
          <div 
            key={driver.id}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ 
              left: `${30 + (index * 15)}%`, 
              top: `${40 + (index * 10)}%` 
            }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-6 h-6 bg-yellow-400 rounded text-white text-xs flex items-center justify-center font-bold">
                  🚗
                </div>
              </div>
              
              {/* Driver info tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="font-medium text-gray-800">{driver.name}</div>
                <div className="text-gray-600">⭐ {driver.rating} • {driver.eta}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-10 h-10 p-0 bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              setZoom(prev => Math.min(prev + 1, 20))
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-10 h-10 p-0 bg-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              setZoom(prev => Math.max(prev - 1, 1))
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Current location button */}
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            variant="outline"
            className="w-12 h-12 p-0 bg-white shadow-lg rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              centerOnUserLocation()
            }}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Navigation className="h-5 w-5 text-blue-600" />
            )}
          </Button>
        </div>

        {/* Loading overlay */}
        {loadingLocation && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Obtendo localização...</span>
            </div>
          </div>
        )}
      </div>

      {/* Map info */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg text-xs">
        <div className="text-gray-600">
          Zoom: {zoom} | Centro: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
        </div>
      </div>
    </Card>
  )
}

export default InteractiveMap
