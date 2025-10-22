import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from '@/types/notifications';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (ids: string[]) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = [],
  onMarkAsRead
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'CREDIT_UPDATE':
        return '💰';
      case 'LICENSE_EXPIRY':
        return '🔑';
      case 'TEAM_INVITE':
        return '👥';
      case 'FEATURE_ANNOUNCEMENT':
        return '🎉';
      case 'SECURITY':
        return '🔒';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const diff = (now.getTime() - new Date(date).getTime()) / 1000;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notifications.filter(n => n.status === 'UNREAD').map(n => n.id))}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-4 px-2 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start p-3 cursor-pointer",
                  notification.status === 'UNREAD' && "bg-gray-50"
                )}
                onClick={() => {
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                  if (notification.status === 'UNREAD') {
                    onMarkAsRead([notification.id]);
                  }
                }}
              >
                <span className="mr-2 text-lg">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;