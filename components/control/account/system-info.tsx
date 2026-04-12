'use client';

import React from 'react';
import { Briefcase, Calendar, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function SystemInfo() {
  return (
    <Card className={cn(
      "border shadow-sm transition-colors",
      // Light Mode: Nền trắng, viền xám
      "bg-white border-zinc-200",
      // Dark Mode: Nền tối, viền tối
      "dark:bg-[#121214] dark:border-zinc-800"
    )}>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-zinc-900 dark:text-white">
          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Trạng thái hệ thống
        </h3>

        {/* Item 1: Phòng ban */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Phòng ban</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">IT Department</p>
          </div>
        </div>

        {/* Item 2: Ngày tham gia */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Ngày tham gia</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">24/12/2025</p>
          </div>
        </div>

        {/* Footer: Login cuối */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Login cuối: Hôm nay, 09:30 AM
          </p>
        </div>

      </CardContent>
    </Card>
  );
}