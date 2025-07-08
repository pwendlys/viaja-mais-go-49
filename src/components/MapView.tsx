
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
  destination?: { lat: number; lng: number };
}

const MapView = ({ drivers, userLocation, destination }: MapViewProps) => {
  return (
    <DashboardMap
      drivers={drivers}
      userLocation={userLocation}
      destination={destination}
    />
  );
};

export default MapView;
