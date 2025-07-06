
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import UserHeader from '@/components/user/UserHeader';
import { toast } from 'sonner';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      last4: '1234',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '26',
      isDefault: true
    },
    {
      id: 2,
      type: 'debit',
      last4: '5678',
      brand: 'Mastercard',
      expiryMonth: '08',
      expiryYear: '25',
      isDefault: false
    }
  ]);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    type: 'credit'
  });

  const userData = {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    rating: 4.8,
    totalTrips: 47,
    memberSince: '2023'
  };

  const handleAddCard = () => {
    if (newCard.number && newCard.name && newCard.expiryMonth && newCard.expiryYear && newCard.cvv) {
      const last4 = newCard.number.slice(-4);
      const brand = newCard.number.startsWith('4') ? 'Visa' : 'Mastercard';
      
      setPaymentMethods([...paymentMethods, {
        id: Date.now(),
        type: newCard.type as 'credit' | 'debit',
        last4,
        brand,
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        isDefault: paymentMethods.length === 0
      }]);
      
      setNewCard({
        number: '',
        name: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        type: 'credit'
      });
      
      setIsAddingCard(false);
      toast.success('Cartão adicionado com sucesso!');
    } else {
      toast.error('Por favor, preencha todos os campos');
    }
  };

  const handleRemoveCard = (id: number) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast.success('Cartão removido com sucesso!');
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast.success('Cartão padrão atualizado!');
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={userData} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Métodos de Pagamento</h1>
            <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
              <DialogTrigger asChild>
                <Button className="gradient-viaja text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cartão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.number}
                      onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="Nome como está no cartão"
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Mês</Label>
                      <Input
                        id="expiryMonth"
                        placeholder="MM"
                        maxLength={2}
                        value={newCard.expiryMonth}
                        onChange={(e) => setNewCard({...newCard, expiryMonth: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Ano</Label>
                      <Input
                        id="expiryYear"
                        placeholder="AA"
                        maxLength={2}
                        value={newCard.expiryYear}
                        onChange={(e) => setNewCard({...newCard, expiryYear: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        maxLength={3}
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsAddingCard(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 gradient-viaja text-white"
                      onClick={handleAddCard}
                    >
                      Adicionar Cartão
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCardIcon(method.brand)}
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {method.brand} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <Badge className="bg-viaja-green text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Padrão
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {method.type === 'credit' ? 'Crédito' : 'Débito'} • 
                          Vence em {method.expiryMonth}/{method.expiryYear}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Tornar Padrão
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveCard(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum método de pagamento cadastrado</p>
                  <p className="text-sm">Adicione um cartão para facilitar seus pagamentos</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Security Info */}
          <Card className="bg-gradient-viaja-subtle border-viaja-blue/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-viaja-blue mb-2">🔒 Segurança Garantida</h3>
                <p className="text-sm text-gray-700">
                  Seus dados de pagamento são criptografados e protegidos com os mais altos padrões de segurança.
                  Não armazenamos informações completas do cartão em nossos servidores.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
