'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

export function CalendarWidget() {
    // Lấy tháng và năm hiện tại
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentMonthName = `Tháng ${month + 1}`;
    const currentDay = now.getDate();

    // Lấy số ngày trong tháng và thứ của ngày đầu tiên
    const daysInMonthCount = new Date(year, month + 1, 0).getDate();
    const daysByMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    
    // JS getDay(): 0 (CN), 1 (T2), ..., 6 (T7)
    // Grid bắt đầu từ T2, nên:
    // T2: 0, T3: 1, T4: 2, T5: 3, T6: 4, T7: 5, CN: 6
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const emptySlots = Array.from({ length: offset }, (_, i) => i);

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <Card className="border-none rounded-[2rem] h-full flex flex-col bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex flex-col flex-1 h-full">
                {/* Header Lịch */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-[#36caf1]" />
                        Lịch làm việc
                    </h3>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                        {currentMonthName}
                    </div>
                </div>

                {/* Cột thứ */}
                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                    {weekDays.map(day => (
                        <div key={day} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Lưới ngày */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 items-start text-center">
                    {/* Ô trống cho đầu tháng */}
                    {emptySlots.map(i => <div key={`empty-${i}`} />)}

                    {daysByMonth.map(day => {
                        const isToday = day === currentDay;

                        return (
                            <div key={day} className="flex justify-center items-center h-10">
                                <div
                                    className={cn(
                                        "flex items-center justify-center h-8 w-8 rounded-full text-[12px] font-bold transition-all duration-300",
                                        isToday 
                                            ? "bg-[#36caf1] text-white shadow-lg shadow-[#36caf1]/30 scale-110 z-10" 
                                            : "text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    {day}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
