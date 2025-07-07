
import React from 'react';
import InteractiveMap from '@/components/maps/InteractiveMap';

interface Driver {
  id: string;
  lat: number;
  lng: number;
  name: string;
  rating: number;
  eta: string;
}

interface MapViewProps {
  drivers: Driver[];
  userLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
}

const MapView = ({ drivers, userLocation, destination }: MapViewProps) => {
  return (
    <InteractiveMap
      drivers={drivers}
      origin={userLocation}
      destination={destination}
      className="w-full h-96"
    />
  );
};

export default MapView;
