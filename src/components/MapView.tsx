
import React from 'react';
import { MapPin } from 'lucide-react';

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
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden shadow-lg">
      {/* Simulated map background */}
      <div className="absolute inset-0 bg-gray-100 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-green-100/30"></div>
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute border-gray-300" style={{
              left: `${i * 5}%`,
              top: 0,
              bottom: 0,
              borderLeft: '1px solid currentColor'
            }} />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="absolute border-gray-300" style={{
              top: `${i * 6.67}%`,
              left: 0,
              right: 0,
              borderTop: '1px solid currentColor'
            }} />
          ))}
        </div>
      </div>

      {/* User location */}
      {userLocation && (
        <div 
          className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: '50%', 
            top: '60%' 
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-viaja-blue rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-viaja-blue rounded-full opacity-30 animate-ping"></div>
          </div>
        </div>
      )}

      {/* Destination */}
      {destination && (
        <div 
          className="absolute z-10 transform -translate-x-1/2 -translate-y-full"
          style={{ 
            left: '70%', 
            top: '30%' 
          }}
        >
          <MapPin className="h-8 w-8 text-viaja-orange drop-shadow-lg" />
        </div>
      )}

      {/* Available drivers */}
      {drivers.map((driver, index) => (
        <div 
          key={driver.id}
          className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ 
            left: `${30 + (index * 15)}%`, 
            top: `${40 + (index * 10)}%` 
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-viaja-green flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-viaja-green rounded text-white text-xs flex items-center justify-center font-bold">
                🚗
              </div>
            </div>
            
            {/* Driver info tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="font-medium text-gray-800">{driver.name}</div>
              <div className="text-gray-600">⭐ {driver.rating} • {driver.eta}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <span className="text-xl font-bold text-gray-700">+</span>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <span className="text-xl font-bold text-gray-700">−</span>
        </button>
      </div>

      {/* Current location button */}
      <div className="absolute bottom-4 right-4">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <div className="w-6 h-6 bg-viaja-blue rounded-full"></div>
        </button>
      </div>
    </div>
  );
};

export default MapView;
