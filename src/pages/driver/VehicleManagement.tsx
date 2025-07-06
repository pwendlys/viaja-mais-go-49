
import React, { useState } from 'react';
import { Car, Plus, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DriverHeader from '@/components/driver/DriverHeader';
import { toast } from 'sonner';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC-1234',
      color: 'Prata',
      status: 'Ativo',
      documents: {
        registration: 'Válido até 12/2024',
        insurance: 'Válido até 06/2024',
        inspection: 'Válido até 03/2024'
      }
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const driverData = {
    name: 'João Santos',
    email: 'joao.santos@email.com',
    rating: 4.9,
    totalRides: 324,
    memberSince: '2022',
    vehicle: 'Honda Civic 2020',
    plate: 'ABC-1234'
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    toast.success('Veículo removido com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800';
      case 'Manutenção':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driver={driverData} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Veículos</h1>
          <Button onClick={handleAddVehicle}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>{vehicle.make} {vehicle.model} {vehicle.year}</span>
                    </CardTitle>
                    <p className="text-gray-600 mt-1">Placa: {vehicle.plate}</p>
                  </div>
                  <Badge className={getStatusColor(vehicle.status)}>
                    {vehicle.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cor:</span>
                    <div className="font-medium">{vehicle.color}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ano:</span>
                    <div className="font-medium">{vehicle.year}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Documentos</span>
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>CRLV:</span>
                      <span className="text-green-600">{vehicle.documents.registration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seguro:</span>
                      <span className="text-green-600">{vehicle.documents.insurance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vistoria:</span>
                      <span className="text-green-600">{vehicle.documents.inspection}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditVehicle(vehicle)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Vehicle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'Editar Veículo' : 'Adicionar Veículo'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Marca</Label>
                  <Input id="make" placeholder="Honda, Toyota..." />
                </div>
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" placeholder="Civic, Corolla..." />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input id="year" type="number" placeholder="2020" />
                </div>
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input id="color" placeholder="Prata, Branco..." />
                </div>
              </div>
              
              <div>
                <Label htmlFor="plate">Placa</Label>
                <Input id="plate" placeholder="ABC-1234" />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setIsDialogOpen(false);
                  toast.success(editingVehicle ? 'Veículo atualizado!' : 'Veículo adicionado!');
                }}>
                  {editingVehicle ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VehicleManagement;
