'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

export function NotificationHeader({ onMarkAllAsRead, unreadCount }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <Bell className="size-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Thông báo</h1>
          <p className="text-xs text-slate-500">
            Bạn có {unreadCount} thông báo mới
          </p>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onMarkAllAsRead}
        className="text-[#36caf1] hover:text-[#36caf1] hover:bg-[#36caf1]/10 rounded-lg transition-all gap-2"
      >
        <CheckCheck className="size-4" />
        Đánh dấu tất cả là đã đọc
      </Button>
    </div>
  );
}
