'use client';

import * as React from 'react';
import { useState } from 'react';
import { NotificationHeader } from '@/components/control/notifications/notification-header';
import { NotificationList } from '@/components/control/notifications/notification-list';
import { NotificationData } from '@/components/control/notifications/notification-item';
import { Card } from '@/components/ui/card';

// Mock data
const INITIAL_NOTIFICATIONS: NotificationData[] = [
  {
    id: '1',
    type: 'task',
    title: 'Công việc mới được giao',
    message: 'Bạn đã được chỉ định vào công việc "Thiết kế giao diện Dashboard" trong dự án Smart SPM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    isRead: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Cập nhật trạng thái dự án',
    message: 'Dự án "ZenWork Mobile App" đã hoàn thành giai đoạn Prototype thành công.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Sắp đến hạn deadline',
    message: 'Công việc "Kiểm thử API" sẽ hết hạn trong vòng 24 giờ tới. Hãy chú ý hoàn thành.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Thông báo hệ thống',
    message: 'Hệ thống sẽ được bảo trì vào lúc 02:00 sáng ngày mai. Vui lòng lưu lại các thay đổi.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
  },
  {
    id: '5',
    type: 'task',
    title: 'Lời mời họp',
    message: 'Bạn có một lời mời họp từ Quản trị viên về việc thảo luận kế hoạch Q3.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div className="w-full">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl overflow-hidden border shadow-none">
          <NotificationHeader 
            unreadCount={unreadCount} 
            onMarkAllAsRead={handleMarkAllAsRead} 
          />
          <div className="overflow-y-auto no-scrollbar">
            <NotificationList 
              notifications={notifications} 
              onRead={handleRead} 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
