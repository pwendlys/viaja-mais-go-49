
import React from 'react';
import { Car, Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

interface DriverHeaderProps {
  driver: {
    name: string;
    email: string;
    rating: number;
    totalRides: number;
    memberSince: string;
    vehicle: string;
    plate: string;
  };
}

const DriverHeader = ({ driver }: DriverHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-3">
        <Link to="/driver/dashboard" className="text-2xl font-bold gradient-viaja bg-clip-text text-transparent">
          Viaja+
        </Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">Painel do Motorista</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-viaja-orange rounded-full"></span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-viaja-green rounded-full flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="hidden md:block text-sm font-medium">
            {driver.name.split(' ')[0]}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DriverHeader;
