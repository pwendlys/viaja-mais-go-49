
import React, { useState } from 'react';
import { Bell, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface NotificationCenterProps {
  userId?: string;
  userType?: 'patient' | 'driver' | 'admin';
}

const NotificationCenter = ({ userId, userType }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isConnected } = useRealtimeNotifications(userId);

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride_request':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'ride_accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'driver_arriving':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'ride_started':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'ride_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    return date.toLocaleDateString();
  };

  if (!userId) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {isConnected && (
          <div className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80 max-h-96 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      {getNotificationIcon(notification.message.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">
                          {notification.message.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message.body}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {notification.status !== 'read' && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Button variant="ghost" size="sm" className="w-full text-sm">
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
