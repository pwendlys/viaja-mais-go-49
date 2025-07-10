
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, User, Car, Star, Navigation } from 'lucide-react';
import { useRideMatching } from '@/hooks/useRideMatching';
import { useRideNotifications } from '@/hooks/useRideNotifications';
import { toast } from 'sonner';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface EnhancedRideRequestProps {
  origin?: Location;
  destination?: Location;
  onLocationSelect?: (type: 'origin' | 'destination', location: Location) => void;
}

const EnhancedRideRequest = ({ 
  origin, 
  destination, 
  onLocationSelect 
}: EnhancedRideRequestProps) => {
  const [step, setStep] = useState<'locations' | 'drivers' | 'confirmation'>('locations');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [rideNotes, setRideNotes] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  
  const { isSearching, availableDrivers, findNearbyDrivers, requestRide } = useRideMatching();
  const { notifyRideRequest } = useRideNotifications();

  const canProceed = origin && destination;

  const handleSearchDrivers = async () => {
    if (!canProceed) {
      toast.error('Por favor, selecione origem e destino.');
      return;
    }

    try {
      const drivers = await findNearbyDrivers({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        maxDistance: 20,
        urgency: 'medium'
      });

      if (drivers.length > 0) {
        setStep('drivers');
        
        // Notificar motoristas sobre nova solicitação
        await notifyRideRequest({
          rideId: 'pending',
          origin,
          destination
        });
      } else {
        toast.error('Nenhum motorista disponível no momento.');
      }
    } catch (error) {
      console.error('Error searching drivers:', error);
      toast.error('Erro ao buscar motoristas.');
    }
  };

  const handleDriverSelect = (driverId: string) => {
    setSelectedDriver(driverId);
    setStep('confirmation');
  };

  const handleConfirmRide = async () => {
    if (!selectedDriver || !origin || !destination) return;

    try {
      await requestRide(selectedDriver, {
        origin,
        destination,
        notes: rideNotes,
        medicalNotes,
        appointmentType
      });

      // Reset form
      setStep('locations');
      setSelectedDriver(null);
      setRideNotes('');
      setMedicalNotes('');
      setAppointmentType('');
      
      toast.success('Corrida solicitada com sucesso!');
    } catch (error) {
      console.error('Error confirming ride:', error);
      toast.error('Erro ao confirmar corrida.');
    }
  };

  const renderLocationStep = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Solicitar Corrida</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Origem
          </label>
          <div className="p-3 border rounded-lg bg-gray-50">
            {origin ? origin.address : 'Clique no mapa para selecionar a origem'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Navigation className="inline h-4 w-4 mr-1" />
            Destino
          </label>
          <div className="p-3 border rounded-lg bg-gray-50">
            {destination ? destination.address : 'Clique no mapa para selecionar o destino'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Consulta</label>
          <Input
            placeholder="Ex: Consulta cardiológica, Exame de sangue..."
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Observações</label>
          <Textarea
            placeholder="Informações adicionais sobre a corrida..."
            value={rideNotes}
            onChange={(e) => setRideNotes(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Informações Médicas</label>
          <Textarea
            placeholder="Necessidades especiais, mobilidade, etc..."
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSearchDrivers}
          disabled={!canProceed || isSearching}
          className="w-full"
        >
          {isSearching ? 'Buscando motoristas...' : 'Buscar Motoristas'}
        </Button>
      </div>
    </Card>
  );

  const renderDriversStep = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Motoristas Disponíveis</h2>
      
      <div className="space-y-3">
        {availableDrivers.map((driver) => (
          <Card 
            key={driver.id}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleDriverSelect(driver.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{driver.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{driver.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{driver.totalRides} corridas</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{driver.estimatedTime}min</span>
                </div>
                <div className="text-xs text-gray-500">
                  {driver.distance.toFixed(1)}km
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {driver.vehicle.model} - {driver.vehicle.plate}
              </span>
              <Badge variant="secondary" className="text-xs">
                {driver.vehicle.type}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Separator className="my-4" />
      
      <Button 
        variant="outline" 
        onClick={() => setStep('locations')}
        className="w-full"
      >
        Voltar
      </Button>
    </Card>
  );

  const renderConfirmationStep = () => {
    const driver = availableDrivers.find(d => d.id === selectedDriver);
    if (!driver) return null;

    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmar Corrida</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Motorista Selecionado</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{driver.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{driver.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{driver.totalRides} corridas</span>
                </div>
                <p className="text-sm text-gray-600">
                  {driver.vehicle.model} - {driver.vehicle.plate}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Detalhes da Corrida</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Origem</p>
                  <p className="text-gray-600">{origin?.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Destino</p>
                  <p className="text-gray-600">{destination?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Tempo estimado: {driver.estimatedTime} minutos</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep('drivers')}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button 
              onClick={handleConfirmRide}
              className="flex-1"
            >
              Confirmar Corrida
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  switch (step) {
    case 'locations':
      return renderLocationStep();
    case 'drivers':
      return renderDriversStep();
    case 'confirmation':
      return renderConfirmationStep();
    default:
      return renderLocationStep();
  }
};

export default EnhancedRideRequest;
