
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AdminAccessButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Show logout button for logged-in users on admin pages
  if (userProfile && location.pathname.startsWith('/admin')) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    );
  }

  // Show admin access button only on login page for non-logged users
  if (location.pathname === '/login' && !userProfile) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => navigate('/admin/dashboard')}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </div>
    );
  }

  return null;
};

export default AdminAccessButton;
