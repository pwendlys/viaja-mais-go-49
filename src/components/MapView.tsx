
import React from 'react';
import GoogleMapComponent from '@/components/maps/GoogleMapComponent';

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
    <GoogleMapComponent
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
