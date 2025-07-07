
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Car, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RideStatus from '@/components/RideStatus';
import UserProfile from '@/components/UserProfile';
import InteractiveRideMap from '@/components/maps/InteractiveRideMap';
import { toast } from 'sonner';

type AppView = 'map' | 'profile';
type RideState = 'idle' | 'searching' | 'driver-assigned' | 'driver-arriving' | 'in-transit' | 'completed';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [rideState, setRideState] = useState<RideState>('idle');
  const [showMenu, setShowMenu] = useState(false);
  
  // User data - will come from database
  const userData = {
    name: 'Usuário',
    email: 'usuario@email.com',
    rating: 0,
    totalTrips: 0,
    memberSince: '2024'
  };

  // Welcome toast effect
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success('Bem-vindo ao Viaja+ 3D! 🌟', {
        description: 'Clique no mapa para definir sua origem e destino.'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestRide = (origin: any, destination: any, vehicleType: string) => {
    setRideState('searching');
    toast.info('🔍 Procurando motoristas na região...', {
      description: `Rota: ${origin.address} → ${destination.address}`
    });
    
    // Simulate searching - in real app, this would connect to database
    setTimeout(() => {
      toast.info('⚠️ Nenhum motorista disponível no momento', {
        description: 'Cadastre motoristas no sistema para ativar as corridas.'
      });
      setRideState('idle');
    }, 3000);
  };

  const handleCancelRide = () => {
    setRideState('idle');
    toast.info('❌ Busca cancelada');
  };

  const handleRateRide = (rating: number) => {
    console.log('Avaliação da corrida:', rating);
    toast.success(`⭐ Obrigado pela avaliação de ${rating} estrelas!`);
    setRideState('idle');
  };

  if (currentView === 'profile') {
    return (
      <UserProfile 
        user={userData} 
        onClose={() => setCurrentView('map')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header com controles aprimorados */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white/95 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white/100 transition-all duration-200"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl shadow-lg border border-white/20 backdrop-blur-sm">
            <h1 className="text-xl font-bold">Viaja+ 3D</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white/95 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white/100 transition-all duration-200"
            onClick={() => setCurrentView('profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Menu lateral aprimorado */}
      {showMenu && (
        <div className="absolute top-0 left-0 z-30 w-80 h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Menu Principal</h2>
                <p className="text-sm text-gray-600">Navegação do sistema</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              <Link to="/login" className="block">
                <Button className="w-full gradient-viaja text-white justify-start shadow-md hover:shadow-lg transition-all duration-200">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar no Sistema
                </Button>
              </Link>
              
              <Link to="/register" className="block">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 transition-all duration-200">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Conta
                </Button>
              </Link>
              
              <Link to="/admin/drivers" className="block">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 transition-all duration-200">
                  <Car className="h-4 w-4 mr-2" />
                  Gerenciar Motoristas
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
              <div className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                🗺️ Mapa Interativo
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <p>✓ Clique para definir origem e destino</p>
                <p>✓ Cálculo automático de preço</p>
                <p>✓ Visualização de rota em tempo real</p>
                <p>✓ Múltiplas opções de veículos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay quando menu está aberto */}
      {showMenu && (
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm z-25 transition-all duration-200"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Mapa interativo em tela cheia */}
      <div className="absolute inset-0">
        {rideState === 'idle' ? (
          <InteractiveRideMap 
            className="w-full h-full"
            onRideRequest={handleRequestRide}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-medium">Processando solicitação...</div>
            </div>
          </div>
        )}
      </div>

      {/* Status da corrida quando ativa */}
      {rideState !== 'idle' && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-white/20">
            <div className="p-6">
              <RideStatus
                status={rideState}
                driver={undefined}
                onCancel={handleCancelRide}
                onRate={handleRateRide}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status do sistema - card flutuante aprimorado */}
      <div className="absolute top-20 right-4 z-15">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">Sistema Interativo</div>
              <div className="text-gray-600 text-xs">Clique no mapa para começar</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-gray-500">Mapa carregado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
