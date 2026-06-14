'use client';

import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Moon, Stars, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarWidget } from '@/components/dashboard/calendar';
import { OverdueAlertsWidget } from '@/components/dashboard/overdue-alerts';
import { TeamStatusWidget, CompactScratchPad, GamificationWidget } from '@/components/dashboard/uniform-widgets';
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

  const [weather, setWeather] = useState<{ temp: string, condition: string, icon: string, city: string } | null>(null);
  
  // Gamification Data (Real-time)
  const [stats, setStats] = useState({
      streak: 1,
      xp: 0,
      totalXp: 0,
      nextLevelXp: 1000,
      rank: 1,
      level: 1,
      levelTitle: 'Tân binh',
      activeDays: [false, false, false, false, false, false, false]
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const res = await fetch('/api/user/gamification');
        const result = await res.json();
        if (result.success) {
          setStats({
            streak: result.data.streak,
            xp: result.data.xp,
            totalXp: result.data.totalXp,
            nextLevelXp: result.data.nextLevelXp,
            rank: result.data.rank,
            level: result.data.level,
            levelTitle: result.data.levelTitle,
            activeDays: result.data.activeDays || [false, false, false, false, false, false, false]
          });
        }
      } catch (e) {
        console.error("Failed to fetch gamification stats:", e);
      }
    };
    fetchGamification();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Không dùng GPS nữa, để API tự đoán vị trí qua IP máy tính
        const res = await fetch(`https://wttr.in/?format=j1`);
        const data = await res.json();
        const current = data.current_condition[0];
        const location = data.nearest_area?.[0];
        
        const cityName = location?.areaName?.[0]?.value || 
                         location?.region?.[0]?.value || 
                         'Vị trí của bạn';

        const desc = current.weatherDesc[0].value.toLowerCase();
        let icon = '☀️';
        if (desc.includes('cloud')) icon = '☁️';
        else if (desc.includes('rain')) icon = '🌧️';
        else if (desc.includes('clear')) icon = '☀️';
        else if (desc.includes('mist') || desc.includes('fog')) icon = '🌫️';

        setWeather({
          temp: current.temp_C,
          condition: current.lang_vi?.[0]?.value || current.weatherDesc[0].value,
          icon: icon,
          city: cityName
        });
      } catch (e) {
        console.error("Weather fetch error:", e);
        setWeather({ temp: '28', condition: 'Nắng nhẹ', icon: '🌤️', city: 'Hà Nội' });
      }
    };
    fetchWeather();
  }, []);



  useEffect(() => {
    const hour = new Date().getHours();
    
    const wishes = {
      morning: [
        "Chúc bạn một ngày mới tràn đầy năng lượng!"
      ],
      afternoon: [
        "Buổi chiều vui vẻ và năng suất nhé"
      ],
      evening: [
        "Chúc bạn một buổi tối ấm áp"
      ],
      night: [
        "Khuya rồi, hãy nhớ đi nghỉ ngơi và giữ gìn sức khỏe nhé."
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
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {timeData.greeting}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed opacity-90">
              {timeData.message}
            </p>
          </div>

          {/* Weather Widget Section */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
             {weather ? (
               <>
                 <div className="flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[12px] font-bold text-slate-700 dark:text-slate-200 border border-white/60 dark:border-slate-700/50 shadow-sm min-w-[100px]">
                    <span className="text-lg">{weather.icon}</span>
                    <span>{weather.temp}°C</span>
                 </div>
                 <div className="flex items-center justify-center gap-2 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[12px] font-bold text-blue-600 dark:text-blue-300 border border-blue-100/50 dark:border-blue-800/30 shadow-sm min-w-[100px]">
                    <CloudSun className="h-3.5 w-3.5" />
                    <span className="capitalize">{weather.condition}</span>
                 </div>
               </>
             ) : (
               <div className="h-8 w-32 bg-slate-200/30 animate-pulse rounded-full" />
             )}
          </div>
        </div>

        {/* Right Side: Status Icon */}
        <div className="flex flex-col items-end justify-center h-full">
            <div className={`p-5 rounded-[2rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-slate-700/50 ${timeData.textColor} shadow-lg shadow-black/5`}>
                <Icon className="h-16 w-16 opacity-90" />
            </div>
        </div>
      </CardContent>

      {/* Gamification Statistics (Footer Style) */}
      <div className="px-6 md:px-8 pb-8 z-10 relative">
          <div className="bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/30 grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              
              {/* Left Column: XP & Progress (3/5 width) */}
              <div className="md:col-span-3 space-y-3 border-r-0 md:border-r border-slate-200/50 dark:border-slate-700/30 md:pr-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                          <div className="bg-[#36caf1] h-7 w-7 flex items-center justify-center rounded-lg text-[10px] text-white font-bold shadow-lg shadow-[#36caf1]/20">XP</div>
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">LV.{stats.level}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Tiến độ hôm nay</span>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.xp}</span>
                          <span className="text-[10px] text-slate-400 font-medium"> / {stats.nextLevelXp} XP</span>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                        value={(stats.xp / stats.nextLevelXp) * 100} 
                        className="h-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full" 
                        indicatorClassName="bg-gradient-to-r from-[#36caf1] to-[#03bdd8]" 
                    />
                    <div className="flex justify-between items-center px-0.5">
                        <span className="text-[10px] font-medium text-slate-500 italic">"Gần đạt mốc tiếp theo rồi, cố lên!"</span>
                        <span className="text-[10px] font-bold text-[#36caf1]">+10 XP hôm nay</span>
                    </div>
                  </div>
              </div>

              {/* Right Column: Daily Streak (2/5 width) */}
              <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <span className="text-xl animate-bounce">🔥</span>
                          <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Daily Streak</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.streak} ngày liên tục</span>
                          </div>
                      </div>
                      <div className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-500/20">
                          +10% XP
                      </div>
                  </div>

                  {/* 7-Day Visual Tracker */}
                  <div className="flex items-center justify-between gap-1 px-1">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                          <div key={day} className="flex flex-col items-center gap-1.5">
                              <div className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                                  stats.activeDays[i] 
                                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`} />
                              <span className={`text-[9px] font-bold ${stats.activeDays[i] ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                  {day}
                              </span>
                          </div>
                      ))}
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