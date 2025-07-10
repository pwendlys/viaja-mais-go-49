
import React, { useState } from 'react';
import { Calendar, Clock, Car, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import LocationAwareAutocomplete from '@/components/maps/LocationAwareAutocomplete';
import { useFormValidation, commonRules } from '@/hooks/useFormValidation';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ScheduleRideFormProps {
  onScheduleRide: (data: {
    vehicleType: string;
    pickup: string;
    destination: string;
    appointmentDate: Date;
    appointmentTime: string;
    notes?: string;
  }) => void;
  onRouteChange?: (origin: Location | null, destination: Location | null) => void;
}

const ScheduleRideForm = ({ onScheduleRide, onRouteChange }: ScheduleRideFormProps) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('tradicional');
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);

  // Error handling and loading states
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { isLoading, withLoading } = useLoadingState(['scheduleRide']);

  // Form validation
  const { errors, validate, clearErrors } = useFormValidation({
    pickup: { required: true, minLength: 10 },
    destination: { required: true, minLength: 10 },
    appointmentDate: { required: true },
    appointmentTime: { required: true }
  });

  const vehicleOptions = [
    {
      id: 'tradicional',
      name: 'Carro Tradicional',
      description: 'Veículo padrão para transporte',
      icon: '🚗',
      eta: '5-10 min'
    },
    {
      id: 'acessivel',
      name: 'Carro Acessível',
      description: 'Veículo adaptado para cadeirantes',
      icon: '♿',
      eta: '10-15 min'
    }
  ];

  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
    if (onRouteChange) {
      onRouteChange(location, destinationLocation);
    }
  };

  const handleDestinationSelect = (location: Location) => {
    setDestinationLocation(location);
    if (onRouteChange) {
      onRouteChange(pickupLocation, location);
    }
  };

  const handleScheduleRide = async () => {
    try {
      // Clear previous errors
      clearErrors();

      // Validate form data
      const formData = {
        pickup: pickup.trim(),
        destination: destination.trim(),
        appointmentDate,
        appointmentTime
      };

      if (!validate(formData)) {
        handleError('Por favor, corrija os erros no formulário');
        return;
      }

      // Additional validations
      if (!appointmentDate) {
        handleError('Por favor, selecione a data da consulta');
        return;
      }

      if (!appointmentTime) {
        handleError('Por favor, selecione o horário da consulta');
        return;
      }

      // Check if appointment is in the future
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      if (appointmentDateTime <= new Date()) {
        handleError('O agendamento deve ser para uma data e horário futuros');
        return;
      }

      // Schedule the ride
      await withLoading('scheduleRide', async () => {
        await onScheduleRide({
          vehicleType: selectedVehicle,
          pickup: pickup.trim(),
          destination: destination.trim(),
          appointmentDate,
          appointmentTime,
          notes: notes.trim() || undefined
        });

        handleSuccess('Transporte agendado com sucesso!');
        
        // Reset form
        setPickup('');
        setDestination('');
        setAppointmentDate(undefined);
        setAppointmentTime('');
        setNotes('');
        setSelectedVehicle('tradicional');
        setPickupLocation(null);
        setDestinationLocation(null);
      });
    } catch (error) {
      handleError(error, 'agendamento de transporte');
    }
  };

  // Prevent selecting past dates
  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-viaja-blue" />
          <span>Agendar Transporte</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pickup Location */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Origem</span>
          </Label>
          <LocationAwareAutocomplete
            value={pickup}
            onChange={setPickup}
            onLocationSelect={handlePickupSelect}
            placeholder="Digite o endereço de origem..."
            className="w-full"
            showCurrentLocation={true}
          />
          {errors.pickup && (
            <p className="text-sm text-red-600">{errors.pickup}</p>
          )}
        </div>

        {/* Destination Location */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Destino</span>
          </Label>
          <LocationAwareAutocomplete
            value={destination}
            onChange={setDestination}
            onLocationSelect={handleDestinationSelect}
            placeholder="Digite o endereço de destino..."
            className="w-full"
            isDestination={true}
          />
          {errors.destination && (
            <p className="text-sm text-red-600">{errors.destination}</p>
          )}
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Data da Consulta</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !appointmentDate && "text-muted-foreground",
                  errors.appointmentDate && "border-red-500"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {appointmentDate ? format(appointmentDate, "PPP", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={appointmentDate}
                onSelect={setAppointmentDate}
                disabled={disablePastDates}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {errors.appointmentDate && (
            <p className="text-sm text-red-600">{errors.appointmentDate}</p>
          )}
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Horário da Consulta</Label>
          <Select value={appointmentTime} onValueChange={setAppointmentTime}>
            <SelectTrigger className={errors.appointmentTime ? "border-red-500" : ""}>
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Selecione o horário" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.appointmentTime && (
            <p className="text-sm text-red-600">{errors.appointmentTime}</p>
          )}
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Tipo de Veículo
          </Label>
          <div className="space-y-2">
            {vehicleOptions.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'border-viaja-blue bg-gradient-viaja-subtle'
                    : 'border-gray-200 hover:border-viaja-blue/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{vehicle.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {vehicle.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {vehicle.description}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {vehicle.eta}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Observações (opcional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais sobre o transporte..."
            className="min-h-[80px]"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">
            {notes.length}/500 caracteres
          </div>
        </div>

        {/* Service Notice */}
        <div className="bg-gradient-viaja-subtle p-3 rounded-lg border border-viaja-blue/20">
          <div className="text-center">
            <p className="text-sm text-viaja-blue font-medium mb-1">
              🚗 Transporte Municipal Gratuito
            </p>
            <p className="text-xs text-gray-700">
              Serviço oferecido pela Prefeitura de Juiz de Fora
            </p>
          </div>
        </div>

        {/* Schedule Button */}
        <Button
          onClick={handleScheduleRide}
          disabled={isLoading('scheduleRide')}
          className="w-full gradient-viaja text-white"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {isLoading('scheduleRide') ? 'Agendando...' : 'Agendar Transporte'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScheduleRideForm;
