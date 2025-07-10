
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminAccessButton = () => {
  const location = useLocation();
  const { isAdmin } = useAdminAuth();

  // Only show on login page
  if (location.pathname !== '/login') {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => window.location.href = '/admin/dashboard'}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Admin
      </Button>
    </div>
  );
};

export default AdminAccessButton;
