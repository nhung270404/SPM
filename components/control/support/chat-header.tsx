'use client';

import { Activity, Bot, Circle, Sparkles } from 'lucide-react';

export function ChatHeader() {
  return (
      <div className="shrink-0 border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600 shadow-sm dark:from-cyan-950 dark:to-blue-950 dark:text-cyan-300">
              <Bot className="size-6" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-950">
              <Circle className="size-2 fill-white text-white" />
            </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  SPM AI Copilot
                </h1>
                <Sparkles className="size-4 text-cyan-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Phân tích tiến độ, task trễ hạn, rủi ro và đề xuất hành động.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Activity className="size-3.5" />
            Đang trực tuyến
          </div>
        </div>
      </div>
  );
}