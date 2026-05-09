'use client';

import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Moon, Stars } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarWidget } from '@/components/dashboard/calendar';
import { OverdueAlertsWidget } from '@/components/dashboard/overdue-alerts';
import { QuickAccessWidget, TeamStatusWidget, CompactScratchPad, GamificationWidget } from '@/components/dashboard/uniform-widgets';
import { Progress } from '@/components/ui/progress';
import { Clock as ClockIcon } from 'lucide-react';

// --- COMPONENT CHÀO HỎI ---
const GreetingSection = () => {
  const [timeData, setTimeData] = useState({
    greeting: 'Xin chào',
    message: 'Chúc bạn một ngày tốt lành!',
    icon: Sun,
    gradient: 'from-[#36caf1]/30 to-[#03bdd8]/10', // Màu mặc định
    textColor: 'text-[#03bdd8]'
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState({ total: 0, completed: 0 });
  
  // Gamification Data (Mock)
  const stats = {
      streak: 7,
      xp: 450,
      nextLevelXp: 1000,
      rank: 2,
      level: 'Chiến binh Agile'
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/notifications/today-progress');
        const result = await res.json();
        if (result.success) {
          setProgress(result.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProgress();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    
    const wishes = {
      morning: [
        "Chúc bạn một ngày mới tràn đầy năng lượng!",
        "Khởi đầu ngày mới thật hiệu quả nhé.",
        "Đừng quên tách cà phê cho ngày mới tỉnh táo!",
        "Hôm nay trời đẹp đấy, hãy làm việc thật tốt nhé."
      ],
      afternoon: [
        "Chúc bạn một buổi chiều làm việc tập trung.",
        "Đã đi được nửa chặng đường trong ngày rồi, cố lên!",
        "Nhớ uống đủ nước và thư giãn một chút nhé.",
        "Buổi chiều vui vẻ và năng suất nhé."
      ],
      evening: [
        "Về nhà nghỉ ngơi thư giãn thôi nào.",
        "Một ngày vất vả rồi, hãy tận hưởng buổi tối nhé.",
        "Chúc bạn một buổi tối ấm áp bên gia đình.",
        "Sạc lại năng lượng để chuẩn bị cho ngày mai nhé."
      ],
      night: [
        "Khuya rồi, hãy nhớ giữ gìn sức khỏe nhé.",
        "Chúc bạn ngủ ngon và có những giấc mơ đẹp.",
        "Không gian yên tĩnh thật tuyệt để suy ngẫm."
      ]
    };

    const getRandomWish = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    if (hour >= 5 && hour < 12) {
      setTimeData({
        greeting: 'Chào buổi sáng',
        message: getRandomWish(wishes.morning),
        icon: Sun,
        gradient: 'from-[#36caf1]/30 to-[#03bdd8]/10',
        textColor: 'text-[#03bdd8] dark:text-[#36caf1]'
      });
    } else if (hour >= 12 && hour < 18) {
      setTimeData({
        greeting: 'Chào buổi chiều',
        message: getRandomWish(wishes.afternoon),
        icon: CloudSun,
        gradient: 'from-sky-400/20 to-[#36caf1]/10',
        textColor: 'text-sky-500 dark:text-sky-400'
      });
    } else if (hour >= 18 && hour < 22) {
      setTimeData({
        greeting: 'Chào buổi tối',
        message: getRandomWish(wishes.evening),
        icon: Moon,
        gradient: 'from-indigo-500/20 to-[#36caf1]/10',
        textColor: 'text-indigo-600 dark:text-indigo-400'
      });
    } else {
      setTimeData({
        greeting: 'Đêm muộn rồi',
        message: getRandomWish(wishes.night),
        icon: Stars,
        gradient: 'from-slate-800/40 to-slate-900/40',
        textColor: 'text-slate-500 dark:text-slate-400'
      });
    }
  }, []);

  const Icon = timeData.icon;

  return (
    <Card className={`relative overflow-hidden border-none bg-white/60 dark:bg-slate-900/60 rounded-[2rem] h-full flex flex-col bg-gradient-to-br ${timeData.gradient} shadow-sm border border-slate-200/50 dark:border-slate-800/50`}>
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between z-10 relative gap-4 flex-1">
        <div className="space-y-5 flex-1">
          {/* Top Row: Contextual Info */}
          <div className="flex flex-wrap items-center gap-2">
             <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                <ClockIcon className="h-3 w-3 text-[#36caf1]" />
                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                <span className="animate-pulse">🔥</span> {stats.streak} Ngày Streak
             </div>
             <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                🏆 Hạng #{stats.rank}
             </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {timeData.greeting}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              {timeData.message}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Navigation Icons */}
        <div className="flex flex-col items-end gap-4">
            <div className={`p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 ${timeData.textColor}`}>
                <Icon className="h-8 w-8 opacity-90" />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                {[
                    { icon: '🚀', label: 'Local' },
                    { icon: '📂', label: 'Docs' },
                    { icon: '🐙', label: 'Git' }
                ].map((item, i) => (
                    <button key={i} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
                        <span className="text-sm">{item.icon}</span>
                    </button>
                ))}
            </div>
        </div>
      </CardContent>

      {/* Gamification Statistics (Footer Style) */}
      <div className="px-6 md:px-8 pb-8 z-10 relative">
          <div className="bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/30 space-y-3">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                      <div className="bg-[#36caf1] h-6 w-6 flex items-center justify-center rounded-md text-[10px] text-white font-bold">XP</div>
                      <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{stats.level}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Tiến độ hôm nay</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{stats.xp}</span>
                      <span className="text-[10px] text-slate-400 font-medium"> / {stats.nextLevelXp} XP</span>
                  </div>
              </div>
              
              <div className="space-y-1.5">
                <Progress 
                    value={(stats.xp / stats.nextLevelXp) * 100} 
                    className="h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full" 
                    indicatorClassName="bg-[#36caf1]" 
                />
                <div className="flex justify-between items-center px-0.5">
                    <span className="text-[10px] font-medium text-slate-500">Hoàn thành: {progress.completed}/{progress.total} mục tiêu</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">+{progress.completed * 50} XP</span>
                </div>
              </div>
          </div>
      </div>
    </Card>
  );
};

// --- COMPONENT CHÍNH ---
export default function ManPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <OverdueAlertsWidget />

      {/* 1. Hàng đầu tiên: Lời chào & Lịch (2:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
        <div className="lg:col-span-2 h-full">
          <GreetingSection />
        </div>
        <div className="lg:col-span-1 h-full">
          <CalendarWidget />
        </div>
      </div>

      {/* 2. Hàng thứ hai: Bộ công cụ Agile (1:1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <TeamStatusWidget />
        <CompactScratchPad />
      </div>
    </div>
  );
}