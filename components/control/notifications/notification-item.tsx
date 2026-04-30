'use client';

import { cn } from '@/lib/utils';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Circle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export type NotificationType = 'info' | 'warning' | 'success' | 'task';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

interface NotificationItemProps {
  notification: NotificationData;
  onRead: (id: string) => void;
}

const typeConfig = {
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  task: {
    icon: Calendar,
    color: 'text-[#36caf1]',
    bg: 'bg-[#36caf1]/10',
  },
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  // Xử lý ngày tháng để tránh lỗi "Invalid time value"
  const rawDate = notification.timestamp || (notification as any).createdAt;
  const dateObj = rawDate ? new Date(rawDate) : new Date();

  return (
    <div 
      onClick={() => onRead(notification.id || (notification as any)._id)}
      className={cn(
        "group relative flex items-start gap-4 p-5 transition-all cursor-pointer border-b border-slate-50 dark:border-slate-900 last:border-0",
        "hover:bg-slate-50 dark:hover:bg-slate-900/50",
        !notification.isRead && "bg-white dark:bg-slate-950"
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#36caf1]" />
      )}

      {/* Icon */}
      <div className={cn("mt-1 p-2 rounded-lg shrink-0", config.bg)}>
        <Icon className={cn("size-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            "text-sm font-medium truncate transition-colors",
            notification.isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
          )}>
            {notification.title}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
            <Clock className="size-3" />
            {formatDistanceToNow(dateObj, { addSuffix: true, locale: vi })}
          </div>
        </div>
        <p className={cn(
          "text-xs leading-relaxed line-clamp-2",
          notification.isRead ? "text-slate-500 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"
        )}>
          {notification.message}
        </p>
      </div>
    </div>
  );
}
