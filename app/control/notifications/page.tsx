'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { NotificationHeader } from '@/components/control/notifications/notification-header';
import { NotificationList } from '@/components/control/notifications/notification-list';
import { NotificationData } from '@/components/control/notifications/notification-item';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from '@/components/ui/sheet';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data
const INITIAL_NOTIFICATIONS: NotificationData[] = [
  {
    id: '1',
    type: 'task',
    title: 'Công việc mới được giao',
    message: 'Bạn đã được chỉ định vào công việc "Thiết kế giao diện Dashboard" trong dự án Smart SPM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    isRead: false,
    link: '/control/projects',
  },
  {
    id: '2',
    type: 'success',
    title: 'Cập nhật trạng thái dự án',
    message: 'Dự án "ZenWork Mobile App" đã hoàn thành giai đoạn Prototype thành công.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    link: '/control/projects',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Sắp đến hạn deadline',
    message: 'Công việc "Kiểm thử API" sẽ hết hạn trong vòng 24 giờ tới. Hãy chú ý hoàn thành.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    link: '/control/projects',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Logic nhóm thông báo theo tiêu đề
  const groupedNotifications = notifications.reduce((acc, n) => {
    const title = n.title;
    if (!acc[title]) acc[title] = [];
    acc[title].push(n);
    return acc;
  }, {} as Record<string, NotificationData[]>);

  const groupList = Object.keys(groupedNotifications).map(title => ({
    title,
    items: groupedNotifications[title],
    isRead: groupedNotifications[title].every(item => item.isRead),
    latestTimestamp: new Date(Math.max(...groupedNotifications[title].map(item => new Date(item.timestamp || (item as any).createdAt).getTime()))),
    type: groupedNotifications[title][0].type
  })).sort((a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime());

  const handleRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(n => (n.id === id || (n as any)._id === id) ? { ...n, isRead: true } : n)
    );
    
    const found = notifications.find(n => (n.id === id || (n as any)._id === id));
    if (found) setSelectedNotification({ ...found, isRead: true });

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ markAll: true }) });
    } catch (error) { console.error(error); }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white dark:bg-[#0a0a0c] h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#36caf1]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0c] h-full flex flex-col">
      <NotificationHeader 
        unreadCount={unreadCount} 
        onMarkAllAsRead={handleMarkAllAsRead} 
      />
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="divide-y divide-slate-50 dark:divide-slate-900">
          {groupList.length > 0 ? (
            groupList.map((group) => (
              <div 
                key={group.title}
                onClick={() => setSelectedGroup(group.title)}
                className="group flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all border-b border-slate-50 dark:border-slate-900 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl relative",
                    group.type === 'warning' ? "bg-amber-500/10 text-amber-500" : 
                    group.type === 'task' ? "bg-[#36caf1]/10 text-[#36caf1]" : "bg-blue-500/10 text-blue-500"
                  )}>
                    <Bell className="size-6" />
                    {!group.isRead && (
                      <span className="absolute top-0 right-0 size-3 bg-[#36caf1] border-2 border-white dark:border-slate-950 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#36caf1] transition-colors">
                      {group.title}
                    </h3>
                      {!group.isRead && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Bạn có thông báo mới
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mới nhất</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {formatDistanceToNow(group.latestTimestamp, { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all">
                    <ExternalLink className="size-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 h-[60vh]">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
                <Bell className="size-10 text-slate-300 dark:text-slate-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chưa có thông báo nào</h3>
                <p className="text-sm text-slate-500 max-w-xs">Hệ thống sẽ gửi thông báo cho bạn khi có cập nhật mới.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Group Detail Sheet */}
      <Sheet open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <SheetContent side="right" className="sm:max-w-md border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0 overflow-hidden flex flex-col">
          {selectedGroup && (
            <>
              <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-900 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#36caf1] uppercase tracking-widest mb-2">
                  <MessageSquare className="size-3" />
                  Danh sách thông báo
                </div>
                <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedGroup}
                </SheetTitle>
                <div className="mt-2">
                   <span className="text-[10px] font-bold px-2 py-0.5 bg-[#36caf1]/10 text-[#36caf1] rounded-full">
                    {groupedNotifications[selectedGroup].length} mục liên quan
                  </span>
                </div>
              </SheetHeader>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar bg-slate-50/50 dark:bg-slate-900/10">
                {groupedNotifications[selectedGroup].map((n, idx) => (
                  <div 
                    key={(n as any)._id || n.id || idx} 
                    onClick={() => handleRead((n as any)._id || n.id)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all space-y-4",
                      n.isRead 
                        ? "bg-white/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-900 opacity-80" 
                        : "bg-white dark:bg-slate-950 border-[#36caf1]/20 shadow-sm shadow-[#36caf1]/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Clock className="size-3.5" />
                        {format(new Date(n.timestamp || (n as any).createdAt), "HH:mm, dd/MM/yyyy", { locale: vi })}
                      </div>
                      {!n.isRead && (
                        <span className="size-2 bg-[#36caf1] rounded-full ring-4 ring-[#36caf1]/10" />
                      )}
                    </div>

                    <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      {n.message}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium italic">
                  Nhấn vào từng mục để đánh dấu đã đọc
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
