
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminHeader from '@/components/admin/AdminHeader';
import { healthTransportApi } from '@/services/healthTransportApi';
import { toast } from 'sonner';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPayment, setNewPayment] = useState({
    driver_id: '',
    amount: '',
    notes: ''
  });

  const adminData = {
    name: 'Administrador Financeiro',
    email: 'financeiro@prefeitura.gov.br',
    role: 'Admin Financeiro'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar pagamentos
      const paymentsData = await healthTransportApi.getDriverPayments();
      setPayments(paymentsData.payments || []);

      // Carregar motoristas (simulado - em produção viria do banco)
      const driversData = [
        { id: '1', name: 'João Santos', total_earnings: 2450.80, pending_amount: 450.30 },
        { id: '2', name: 'Maria Silva', total_earnings: 1890.50, pending_amount: 320.00 },
        { id: '3', name: 'Carlos Oliveira', total_earnings: 3200.20, pending_amount: 680.75 }
      ];
      setDrivers(driversData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!newPayment.driver_id || !newPayment.amount) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      await healthTransportApi.createDriverPayment(
        newPayment.driver_id,
        parseFloat(newPayment.amount),
        newPayment.notes
      );

      toast.success('Pagamento registrado com sucesso!');
      setIsPaymentModalOpen(false);
      setNewPayment({ driver_id: '', amount: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const filteredPayments = payments.filter((payment: any) =>
    payment.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viaja-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={adminData} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Pagamentos</h1>
            <p className="text-gray-600">Controle de pagamentos aos motoristas</p>
          </div>
          
          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-viaja text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Pagamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Motorista</Label>
                  <Select value={newPayment.driver_id} onValueChange={(value) => setNewPayment(prev => ({ ...prev, driver_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver: any) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - Pendente: R$ {driver.pending_amount.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre o pagamento..."
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsPaymentModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 gradient-viaja text-white">
                    Registrar Pagamento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Saldo dos Motoristas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {drivers.map((driver: any) => (
            <Card key={driver.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-gray-600">Total: R$ {driver.total_earnings.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-viaja-green">
                      R$ {driver.pending_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Pendente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pagamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Histórico de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum Pagamento Registrado
                </h3>
                <p className="text-gray-500 mb-6">
                  Os pagamentos realizados aos motoristas aparecerão aqui.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.profiles?.full_name || 'Motorista'}
                      </TableCell>
                      <TableCell className="font-bold text-viaja-green">
                        R$ {payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_method}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {payment.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManagement;
