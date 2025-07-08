
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

interface DashboardMapProps {
  drivers: Driver[];
  userLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
}

const DashboardMap = ({ drivers, userLocation, destination }: DashboardMapProps) => {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <SecureMapboxComponent
        drivers={drivers}
        origin={userLocation}
        destination={destination}
        className="w-full h-full"
        center={{ lat: -21.7554, lng: -43.3636 }} // Juiz de Fora
        zoom={13}
      />
    </div>
  );
};

export default DashboardMap;
