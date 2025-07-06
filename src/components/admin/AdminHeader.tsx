
import React from 'react';
import { Shield, Bell, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
}

const AdminHeader = ({ admin }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-3">
        <Link to="/admin/dashboard" className="text-2xl font-bold gradient-viaja bg-clip-text text-transparent">
          Viaja+
        </Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">Painel Administrativo</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/admin/users" className="text-gray-600 hover:text-viaja-blue transition-colors">
            Usuários
          </Link>
          <Link to="/admin/drivers" className="text-gray-600 hover:text-viaja-blue transition-colors">
            Motoristas
          </Link>
          <Link to="/admin/rides" className="text-gray-600 hover:text-viaja-blue transition-colors">
            Corridas
          </Link>
          <Link to="/admin/analytics" className="text-gray-600 hover:text-viaja-blue transition-colors">
            Analytics
          </Link>
        </nav>
        
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">{admin.name}</div>
            <div className="text-xs text-gray-600">{admin.role}</div>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
