'use client';

import { Bot, Circle } from 'lucide-react';

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#36caf1]/10 rounded-xl">
          <Bot className="size-6 text-[#36caf1]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Hỗ trợ SPM</h1>
          <div className="flex items-center gap-1.5">
            <Circle className="size-2 fill-emerald-500 text-emerald-500" />
            <span className="text-xs text-slate-500">Đang trực tuyến</span>
          </div>
        </div>
      </div>
    </div>
  );
}
