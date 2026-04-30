'use client';

import { NotificationItem, NotificationData } from './notification-item';
import { Inbox } from 'lucide-react';

interface NotificationListProps {
  notifications: NotificationData[];
  onRead: (id: string) => void;
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full mb-4">
          <Inbox className="size-10" />
        </div>
        <p className="text-sm font-medium">Hộp thư thông báo trống</p>
        <p className="text-xs">Bạn hiện không có thông báo nào mới.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id || (notification as any)._id} 
          notification={notification} 
          onRead={onRead} 
        />
      ))}
    </div>
  );
}
