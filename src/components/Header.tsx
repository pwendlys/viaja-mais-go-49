
import React from 'react';
import { User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName: string;
  onProfileClick: () => void;
}

const Header = ({ userName, onProfileClick }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-3">
        <div className="text-2xl font-bold text-high-contrast">
          <span className="text-viaja-blue">Viaja</span>
          <span className="text-viaja-green">+</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-viaja-orange rounded-full"></span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onProfileClick}
          className="flex items-center space-x-2"
        >
          <div className="h-8 w-8 bg-viaja-blue rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <span className="hidden md:block text-sm font-semibold text-high-contrast">
            Olá, {userName}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Header;
