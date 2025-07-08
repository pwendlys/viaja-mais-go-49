
import React from 'react';
import DashboardMap from '@/components/DashboardMap';

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
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
}

const MapView = ({ drivers, userLocation, origin, destination }: MapViewProps) => {
  return (
    <DashboardMap
      drivers={drivers}
      userLocation={userLocation}
      origin={origin}
      destination={destination}
    />
  );
};

export default MapView;
