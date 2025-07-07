
import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Navigation, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Driver {
  id: string
  name: string
  lat: number
  lng: number
  rating: number
  eta: string
}

interface GoogleMapComponentProps {
  drivers?: Driver[]
  origin?: { lat: number; lng: number; address?: string }
  destination?: { lat: number; lng: number; address?: string }
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  className?: string
  center?: { lat: number; lng: number }
  zoom?: number
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

const GoogleMapComponent = ({ 
  drivers = [], 
  origin, 
  destination, 
  onLocationSelect,
  className = "",
  center = { lat: -21.7554, lng: -43.3636 }, // Juiz de Fora como padrão
  zoom = 15
}: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // Carregar Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R0&libraries=places`
    script.async = true
    script.defer = true
    
    window.initGoogleMaps = () => {
      setIsLoaded(true)
    }
    
    script.onload = window.initGoogleMaps
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
        },
        (error) => {
          console.warn('Erro ao obter localização:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      )
    }
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const mapCenter = userLocation || center
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: zoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ weight: "2.00" }]
        },
        {
          featureType: "all",
          elementType: "geometry.stroke",
          stylers: [{ color: "#9c9c9c" }]
        },
        {
          featureType: "all",
          elementType: "labels.text",
          stylers: [{ visibility: "on" }]
        }
      ],
      streetViewControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: false
    })

    mapInstanceRef.current = map

    // Adicionar click listener
    if (onLocationSelect) {
      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        onLocationSelect({ lat, lng })
      })
    }

    // Limpar markers anteriores
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: any[] = []

    // Adicionar marker da localização do usuário
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Sua localização',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })
      newMarkers.push(userMarker)
    }

    // Adicionar marker de origem
    if (origin) {
      const originMarker = new window.google.maps.Marker({
        position: origin,
        map: map,
        title: 'Origem: ' + (origin.address || 'Ponto de partida'),
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">A</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })
      newMarkers.push(originMarker)
    }

    // Adicionar marker de destino
    if (destination) {
      const destMarker = new window.google.maps.Marker({
        position: destination,
        map: map,
        title: 'Destino: ' + (destination.address || 'Ponto de chegada'),
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">B</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })
      newMarkers.push(destMarker)
    }

    // Adicionar markers dos motoristas
    drivers.forEach((driver, index) => {
      const driverMarker = new window.google.maps.Marker({
        position: { lat: driver.lat, lng: driver.lng },
        map: map,
        title: `${driver.name} - ⭐${driver.rating} - ${driver.eta}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" font-size="16">🚗</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })
      newMarkers.push(driverMarker)
    })

    setMarkers(newMarkers)

    // Ajustar visualização se houver origem e destino
    if (origin && destination) {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(origin)
      bounds.extend(destination)
      map.fitBounds(bounds)
      
      // Desenhar rota
      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
      
      directionsRenderer.setMap(map)
      
      directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result)
        }
      })
    }
  }, [isLoaded, userLocation, origin, destination, drivers, center, zoom])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom()
      mapInstanceRef.current.setZoom(currentZoom + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom()
      mapInstanceRef.current.setZoom(currentZoom - 1)
    }
  }

  const centerOnUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location)
          mapInstanceRef.current.setZoom(16)
        }
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Carregando mapa...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Controles de zoom */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white shadow-lg"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white shadow-lg"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Botão de localização atual */}
      <div className="absolute bottom-4 right-4">
        <Button
          size="sm"
          variant="outline"
          className="w-12 h-12 p-0 bg-white shadow-lg rounded-full"
          onClick={centerOnUserLocation}
        >
          <Navigation className="h-5 w-5 text-blue-600" />
        </Button>
      </div>
    </div>
  )
}

export default GoogleMapComponent
