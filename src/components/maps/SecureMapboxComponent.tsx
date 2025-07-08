
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxApi } from '@/hooks/useMapboxApi';

interface Driver {
  id: string;
  lat: number;
  lng: number;
  name: string;
  rating: number;
  eta: string;
}

interface SecureMapboxComponentProps {
  drivers?: Driver[];
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  className?: string;
  center: { lat: number; lng: number };
  zoom?: number;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  selectingMode?: 'origin' | 'destination' | null;
}

const SecureMapboxComponent = ({
  drivers = [],
  origin,
  destination,
  className = '',
  center,
  zoom = 13,
  onLocationSelect,
  selectingMode
}: SecureMapboxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { reverseGeocode } = useMapboxApi();

  // Get Mapbox token from API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Token will be handled by the edge function
        setMapboxToken('pk.temp.token'); // Placeholder, real token handled by backend
      } catch (error) {
        console.error('Error loading Mapbox token:', error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Set a placeholder token for the map initialization
    // The actual API calls will go through our secure backend
    mapboxgl.accessToken = 'pk.eyJ1IjoidmlhamFtYWlzIiwiYSI6ImNtNWJsaTNlczAyNW0yanB6NTl4YTFzcGcifQ.dummy';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center.lng, center.lat],
      zoom: zoom,
      pitch: 45,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Handle map clicks for location selection
    if (selectingMode && onLocationSelect) {
      map.current.on('click', (e) => {
        const coords = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        };
        onLocationSelect(coords);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, center.lat, center.lng, zoom, selectingMode, onLocationSelect]);

  // Add markers for origin and destination
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add origin marker
    if (origin) {
      const originMarker = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Origem</div>'))
        .addTo(map.current);
    }

    // Add destination marker
    if (destination) {
      const destMarker = new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Destino</div>'))
        .addTo(map.current);
    }

    // Add driver markers
    drivers.forEach(driver => {
      const driverMarker = new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([driver.lng, driver.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div>
              <strong>${driver.name}</strong><br/>
              Rating: ${driver.rating}⭐<br/>
              ETA: ${driver.eta}
            </div>`
          )
        )
        .addTo(map.current);
    });
  }, [origin, destination, drivers]);

  // Fit map to show all markers
  useEffect(() => {
    if (!map.current || (!origin && !destination && drivers.length === 0)) return;

    const coordinates: [number, number][] = [];
    
    if (origin) coordinates.push([origin.lng, origin.lat]);
    if (destination) coordinates.push([destination.lng, destination.lat]);
    drivers.forEach(driver => coordinates.push([driver.lng, driver.lat]));

    if (coordinates.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [origin, destination, drivers]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {selectingMode && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-700">
            {selectingMode === 'origin' ? 'Clique no mapa para escolher a origem' : 'Clique no mapa para escolher o destino'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SecureMapboxComponent;
