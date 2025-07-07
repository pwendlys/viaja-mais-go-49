
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

  // Inicializar mapa 3D
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return

    mapboxgl.accessToken = mapboxToken

    const mapCenter = userLocation || center
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: zoom,
      pitch: 60, // Perspectiva 3D inclinada
      bearing: -17.6, // Rotação inicial
      antialias: true // Para melhor qualidade visual
    })

    map.current.on('load', () => {
      setIsLoaded(true)
      
      // Adicionar controles de navegação 3D
      map.current!.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }), 'top-right')
      
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

      // Adicionar layer 3D de construções com estilo melhorado
      map.current!.addLayer({
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'height'],
            0, '#b3b3b3',
            50, '#a0a0a0',
            100, '#8a8a8a'
          ],
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
          'fill-extrusion-opacity': 0.7
        }
      })

      // Adicionar camada de tráfego em tempo real
      map.current!.addSource('mapbox-traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1'
      })

      map.current!.addLayer({
        'id': 'traffic',
        'type': 'line',
        'source': 'mapbox-traffic',
        'source-layer': 'traffic',
        'paint': {
          'line-width': [
            'case',
            ['==', ['get', 'congestion'], 'low'], 4,
            ['==', ['get', 'congestion'], 'moderate'], 6,
            ['==', ['get', 'congestion'], 'heavy'], 8,
            ['==', ['get', 'congestion'], 'severe'], 10,
            2
          ],
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'low'], '#4CAF50',
            ['==', ['get', 'congestion'], 'moderate'], '#FF9800',
            ['==', ['get', 'congestion'], 'heavy'], '#F44336',
            ['==', ['get', 'congestion'], 'severe'], '#9C27B0',
            '#757575'
          ],
          'line-opacity': 0.8
        }
      })

      // Adicionar atmosfera e efeitos de neblina para realismo
      map.current!.setFog({
        'range': [1, 20],
        'color': 'hsl(210, 76%, 87%)',
        'high-color': 'hsl(210, 76%, 90%)',
        'space-color': 'hsl(210, 50%, 85%)',
        'horizon-blend': 0.1,
        'star-intensity': 0.2
      })

      // Adicionar luz ambiente para melhor visualização 3D
      map.current!.setLight({
        'anchor': 'viewport',
        'color': 'white',
        'intensity': 0.4
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

  // Gerenciar marcadores e rotas 3D
  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Limpar markers anteriores
    markers.forEach(marker => marker.remove())
    const newMarkers: mapboxgl.Marker[] = []

    // Marker da localização do usuário com animação
    if (userLocation) {
      const userMarkerElement = document.createElement('div')
      userMarkerElement.className = 'user-location-marker'
      userMarkerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, #4285F4 30%, rgba(66, 133, 244, 0.3) 70%);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      `
      
      const userMarker = new mapboxgl.Marker({ element: userMarkerElement })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>📍 Sua localização</h3>'))
        .addTo(map.current)
      newMarkers.push(userMarker)
    }

    // Marker de origem com estilo personalizado
    if (origin) {
      const originElement = document.createElement('div')
      originElement.className = 'origin-marker'
      originElement.style.cssText = `
        width: 30px;
        height: 30px;
        background: linear-gradient(45deg, #22c55e, #16a34a);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
      `
      originElement.innerHTML = '🚀'
      
      const originMarker = new mapboxgl.Marker({ element: originElement })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>🚀 Origem</h3><p>${origin.address || 'Ponto de partida'}</p>`))
        .addTo(map.current)
      newMarkers.push(originMarker)
    }

    // Marker de destino com estilo personalizado
    if (destination) {
      const destElement = document.createElement('div')
      destElement.className = 'destination-marker'
      destElement.style.cssText = `
        width: 30px;
        height: 30px;
        background: linear-gradient(45deg, #ef4444, #dc2626);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
      `
      destElement.innerHTML = '🎯'
      
      const destMarker = new mapboxgl.Marker({ element: destElement })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>🎯 Destino</h3><p>${destination.address || 'Ponto de chegada'}</p>`))
        .addTo(map.current)
      newMarkers.push(destMarker)
    }

    // Markers dos motoristas com animação
    drivers.forEach((driver) => {
      const driverElement = document.createElement('div')
      driverElement.className = 'driver-marker'
      driverElement.style.cssText = `
        width: 35px;
        height: 35px;
        background: linear-gradient(45deg, #fbbf24, #f59e0b);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        animation: bounce 2s infinite;
      `
      driverElement.innerHTML = '🚗'
      
      const driverMarker = new mapboxgl.Marker({ element: driverElement })
        .setLngLat([driver.lng, driver.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="text-align: center;">
            <h3>🚗 ${driver.name}</h3>
            <p>⭐ ${driver.rating} • ⏱️ ${driver.eta}</p>
            <p style="font-size: 12px; color: #666;">Motorista disponível</p>
          </div>
        `))
        .addTo(map.current!)
      newMarkers.push(driverMarker)
    })

    setMarkers(newMarkers)

    // Ajustar visualização e desenhar rota animada se houver origem e destino
    if (origin && destination) {
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([origin.lng, origin.lat])
      bounds.extend([destination.lng, destination.lat])
      
      // Ajustar a visualização com padding e perspectiva 3D
      map.current.fitBounds(bounds, { 
        padding: { top: 100, bottom: 200, left: 50, right: 50 },
        pitch: 60,
        bearing: -17.6
      })

      // Desenhar rota usando nossa API segura com animação
      calculateRoute(origin, destination)
        .then(data => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0]
            
            // Remover rota anterior se existir
            if (map.current!.getSource('route')) {
              map.current!.removeLayer('route-glow')
              map.current!.removeLayer('route')
              map.current!.removeSource('route')
            }
            
            // Adicionar nova rota com efeito de brilho
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            })
            
            // Camada de brilho/sombra
            map.current!.addLayer({
              id: 'route-glow',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#4285F4',
                'line-width': 12,
                'line-opacity': 0.3,
                'line-blur': 4
              }
            })
            
            // Camada principal da rota
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
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  12, 4,
                  18, 8
                ],
                'line-opacity': 0.9
              }
            })

            // Adicionar animação da rota
            let animationCounter = 0
            const animateRoute = () => {
              animationCounter += 0.05
              if (map.current && map.current.getLayer('route')) {
                map.current.setPaintProperty('route', 'line-dasharray', [
                  Math.sin(animationCounter) * 2 + 2,
                  Math.cos(animationCounter) * 2 + 2
                ])
              }
              requestAnimationFrame(animateRoute)
            }
            animateRoute()
          }
        })
        .catch(error => console.error('Erro ao calcular rota:', error))
    }
  }, [isLoaded, userLocation, origin, destination, drivers, calculateRoute])

  // Adicionar estilos CSS para animações
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-5px); }
        60% { transform: translateY(-3px); }
      }
      .mapboxgl-popup-content {
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        border: none;
      }
      .mapboxgl-popup-tip {
        border-top-color: white;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!mapboxToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg`}>
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🗺️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Mapa 3D Mapbox Seguro
          </h3>
          <p className="text-sm text-gray-600">
            Sistema integrado com backend seguro e visualização 3D avançada
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg`}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-center">
            <span className="text-gray-600 font-medium">Carregando Mapa 3D</span>
            <p className="text-sm text-gray-500 mt-1">Preparando visualização avançada...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Indicador de modo 3D */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Modo 3D Ativo</span>
        </div>
      </div>
    </div>
  )
}

export default SecureMapboxComponent
