
import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Loader2 } from 'lucide-react'
import { useMapboxApi } from '@/hooks/useMapboxApi'

interface Driver {
  id: string
  name: string
  lat: number
  lng: number
  rating: number
  eta: string
}

interface SecureMapboxComponentProps {
  drivers?: Driver[]
  origin?: { lat: number; lng: number; address?: string }
  destination?: { lat: number; lng: number; address?: string }
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  className?: string
  center?: { lat: number; lng: number }
  zoom?: number
}

const SecureMapboxComponent = ({ 
  drivers = [], 
  origin, 
  destination, 
  onLocationSelect,
  className = "",
  center = { lat: -21.7554, lng: -43.3636 }, // Juiz de Fora como padrão
  zoom = 15
}: SecureMapboxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])
  const { calculateRoute } = useMapboxApi()

  // Obtém a chave do localStorage para exibir o mapa
  const mapboxToken = localStorage.getItem('mapbox_token')

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
    if (!mapboxToken || !mapContainer.current) return

    mapboxgl.accessToken = mapboxToken

    const mapCenter = userLocation || center
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: zoom,
      pitch: 45,
      bearing: 0
    })

    map.current.on('load', () => {
      setIsLoaded(true)
      
      // Adicionar controles de navegação
      map.current!.addControl(new mapboxgl.NavigationControl(), 'top-right')
      
      // Adicionar controle de localização
      map.current!.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      )

      // Adicionar layer 3D de construções
      map.current!.addLayer({
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      })
    })

    // Adicionar click listener
    if (onLocationSelect) {
      map.current.on('click', (e) => {
        onLocationSelect({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      })
    }

    return () => {
      map.current?.remove()
    }
  }, [mapboxToken, userLocation, center, zoom, onLocationSelect])

  // Gerenciar marcadores e rotas
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Limpar markers anteriores
    markers.forEach(marker => marker.remove())
    const newMarkers: mapboxgl.Marker[] = []

    // Marker da localização do usuário
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({ color: '#4285F4' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Sua localização</h3>'))
        .addTo(map.current)
      newMarkers.push(userMarker)
    }

    // Marker de origem
    if (origin) {
      const originMarker = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>Origem</h3><p>${origin.address || 'Ponto de partida'}</p>`))
        .addTo(map.current)
      newMarkers.push(originMarker)
    }

    // Marker de destino
    if (destination) {
      const destMarker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destino</h3><p>${destination.address || 'Ponto de chegada'}</p>`))
        .addTo(map.current)
      newMarkers.push(destMarker)
    }

    // Markers dos motoristas
    drivers.forEach((driver) => {
      const driverMarker = new mapboxgl.Marker({ color: '#fbbf24' })
        .setLngLat([driver.lng, driver.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3>${driver.name}</h3>
          <p>⭐ ${driver.rating} • ${driver.eta}</p>
        `))
        .addTo(map.current!)
      newMarkers.push(driverMarker)
    })

    setMarkers(newMarkers)

    // Ajustar visualização e desenhar rota se houver origem e destino
    if (origin && destination) {
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([origin.lng, origin.lat])
      bounds.extend([destination.lng, destination.lat])
      map.current.fitBounds(bounds, { padding: 50 })

      // Desenhar rota usando nossa API segura
      calculateRoute(origin, destination)
        .then(data => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0]
            
            // Remover rota anterior se existir
            if (map.current!.getSource('route')) {
              map.current!.removeLayer('route')
              map.current!.removeSource('route')
            }
            
            // Adicionar nova rota
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            })
            
            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#4285F4',
                'line-width': 4,
                'line-opacity': 0.8
              }
            })
          }
        })
        .catch(error => console.error('Erro ao calcular rota:', error))
    }
  }, [isLoaded, userLocation, origin, destination, drivers, calculateRoute])

  if (!mapboxToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Mapa Mapbox Seguro
          </h3>
          <p className="text-sm text-gray-600">
            As requisições são feitas através do backend para máxima segurança.
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Carregando mapa seguro...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  )
}

export default SecureMapboxComponent
