
import React, { useState } from 'react';
import { Clock, Car } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImprovedRideRequest from '@/components/ImprovedRideRequest';
import ScheduleRideForm from '@/components/ScheduleRideForm';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface TabbedRideRequestProps {
  onRequestRide: (vehicleType: string, pickup: string, destination: string) => void;
  onScheduleRide: (data: {
    vehicleType: string;
    pickup: string;
    destination: string;
    appointmentDate: Date;
    appointmentTime: string;
    notes?: string;
  }) => void;
  prefilledDestination?: string;
  onRouteChange?: (origin: Location | null, destination: Location | null) => void;
}

const TabbedRideRequest = ({ 
  onRequestRide, 
  onScheduleRide,
  prefilledDestination = '',
  onRouteChange 
}: TabbedRideRequestProps) => {
  const [activeTab, setActiveTab] = useState('immediate');

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="immediate" className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>Agora</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Agendar</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="immediate" className="mt-4">
          <ImprovedRideRequest 
            onRequestRide={onRequestRide}
            prefilledDestination={prefilledDestination}
            onRouteChange={onRouteChange}
          />
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-4">
          <ScheduleRideForm 
            onScheduleRide={onScheduleRide}
            onRouteChange={onRouteChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabbedRideRequest;
