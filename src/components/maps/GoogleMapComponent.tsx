
import React, { useRef, useEffect, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { DEFAULT_MAP_CONFIG } from '@/config/googleMaps';

interface GoogleMapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; title?: string; icon?: string }>;
  onMapClick?: (location: { lat: number; lng: number }) => void;
  showDirections?: boolean;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
}

const GoogleMapComponent = ({
  center = DEFAULT_MAP_CONFIG.center,
  zoom = DEFAULT_MAP_CONFIG.zoom,
  markers = [],
  onMapClick,
  showDirections = false,
  origin,
  destination,
}: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  
  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: DEFAULT_MAP_CONFIG.styles,
    });

    if (onMapClick) {
      googleMap.addListener('click', (event: any) => {
        if (event.latLng) {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
        }
      });
    }

    setMap(googleMap);
  }, [isLoaded, center, zoom, onMapClick, map]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Adicionar novos marcadores
    markers.forEach((marker) => {
      new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title || '',
        icon: marker.icon,
      });
    });
  }, [map, markers, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded || !showDirections || !origin || !destination) {
      return;
    }

    if (!directionsRenderer) {
      const renderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#007bff',
          strokeWeight: 4,
        },
      });
      renderer.setMap(map);
      setDirectionsRenderer(renderer);
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
      origin,
      destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK' && result && directionsRenderer) {
        directionsRenderer.setDirections(result);
      }
    });
  }, [map, isLoaded, showDirections, origin, destination, directionsRenderer]);

  if (loadError) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-red-600">Erro ao carregar o mapa: {loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-96 rounded-lg" />;
};

export default GoogleMapComponent;
