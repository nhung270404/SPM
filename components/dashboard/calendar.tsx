import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // Các ngày ví dụ (Đã lược bỏ logic sự kiện theo yêu cầu)
    const scheduledDays: number[] = [];
    const doneDays: number[] = [];

    return (
        <Card className="border-none rounded-[2rem] h-full flex flex-col bg-[#f8fafc] dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col flex-1">
                {/* Header Lịch */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
                        Lịch làm việc
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                        {currentMonthName}
                    </div>
                </div>

                {/* Cột thứ */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Lưới ngày */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 flex-1 items-start text-center">
                    {/* Ô trống cho đầu tháng */}
                    {emptySlots.map(i => <div key={`empty-${i}`} />)}

                    {daysByMonth.map(day => {
                        const isToday = day === currentDay;
                        const hasTask = scheduledDays.includes(day);
                        const isFinished = doneDays.includes(day);
                        const isPast = day < currentDay;
                        const isFuture = day > currentDay;

                        // Phân loại trạng thái
                        let statusStyle = "";
                        if (isToday) {
                            statusStyle = "bg-[#36caf1] text-white shadow-lg shadow-[#36caf1]/30 scale-110 z-10";
                        } else {
                            statusStyle = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
                        }

                        return (
                            <div key={day} className="flex justify-center items-center h-8">
                                <button
                                    className={cn(
                                        "flex items-center justify-center h-7 w-7 rounded-full text-[12px] font-bold transition-all duration-300",
                                        statusStyle
                                    )}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Chú thích (Legend) */}
                <div className="mt-4 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#36caf1] shadow-sm shadow-[#36caf1]/40"></div>
                        <span>Hôm nay</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
