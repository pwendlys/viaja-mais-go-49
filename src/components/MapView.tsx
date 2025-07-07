
import React from 'react';
import SecureMapboxComponent from '@/components/maps/SecureMapboxComponent';

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
    <SecureMapboxComponent
      drivers={drivers}
      origin={userLocation}
      destination={destination}
      className="w-full h-96"
      center={{ lat: -21.7554, lng: -43.3636 }} // Juiz de Fora
      zoom={13}
    />
  );
};

export default MapView;
