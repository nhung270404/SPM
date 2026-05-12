'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function OverdueAlertsWidget() {
    const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchOverdue = async () => {
            try {
                const res = await fetch('/api/notifications/overdue');
                const result = await res.json();
                if (result.success && result.data.length > 0) {
                    setOverdueTasks(result.data);
                }
            } catch (e) {
                console.error('Failed to fetch overdue tasks:', e);
            }
        };
        fetchOverdue();
    }, []);

    if (overdueTasks.length === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer group">
                        {/* Nhãn cảnh báo hiện ra bên cạnh chuông */}
                        {!isOpen && (
                            <div className="bg-rose-500/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-xl shadow-rose-500/20 border border-rose-400/50 flex items-center gap-2 animate-in slide-in-from-right-8 fade-in duration-700">
                                <AlertCircle className="h-4 w-4 animate-pulse" />
                                <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                                    Trễ {overdueTasks.length} công việc!
                                </span>
                            </div>
                        )}

                        <button 
                            className={cn(
                                "relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 active:scale-90",
                                isOpen 
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90" 
                                    : "bg-rose-500 text-white hover:bg-rose-600 hover:scale-110"
                            )}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : (
                                <>
                                    <BellRing className="h-6 w-6 animate-shake" />
                                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-white text-[10px] font-bold">
                                        {overdueTasks.length}
                                    </span>
                                </>
                            )}
                            {!isOpen && (
                                <>
                                    <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25" />
                                    <span className="absolute -inset-2 rounded-full bg-rose-500/10 animate-pulse" />
                                </>
                            )}
                        </button>
                    </div>
                </PopoverTrigger>
                
                <PopoverContent 
                    side="top" 
                    align="end" 
                    sideOffset={15}
                    className="w-[300px] p-0 rounded-[2rem] border-none shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden"
                >
                    <div className="bg-rose-500 p-5 text-white">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5" />
                            <h4 className="font-bold text-sm uppercase tracking-wider">Quá hạn!</h4>
                        </div>
                        <p className="text-[11px] font-medium opacity-90 mt-1">
                            Danh sách {overdueTasks.length} việc cần xử lý gấp:
                        </p>
                    </div>

                    <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {overdueTasks.map((task) => (
                                <div 
                                    key={task._id}
                                    className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-colors"
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-3 bg-[#36caf1] rounded-full" />
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate max-w-[200px]">
                                                {task.project?.title || 'Dự án'}
                                            </span>
                                        </div>
                                        <p className="text-[14px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                            {task.title}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1.5 text-rose-500">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">
                                                Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(10deg); }
                    75% { transform: rotate(-10deg); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
