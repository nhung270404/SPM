import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CalendarWidget() {
    // Lấy tháng và năm hiện tại
    const now = new Date();
    const currentMonthName = now.toLocaleString('vi-VN', { month: 'short' });
    const currentDay = now.getDate();

    // Mô phỏng số ngày trong tháng hiện tại (Mặc định 30 ngày cho demo)
    const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // Các ngày ví dụ có chứa sự kiện
    const scheduledDays = [14, 17, 19, 23, 28];
    const doneDays = [1, 5];

    return (
        <Card className="border-none rounded-[2rem] h-full flex flex-col bg-[#f8fafc] dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col flex-1">
                {/* Header Lịch */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
                        Lịch làm việc
                    </h3>
                    <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#03bdd8] dark:hover:text-[#36caf1] transition-colors">
                        {currentMonthName} <ChevronDown className="h-4 w-4" />
                    </button>
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
                    {/* Giả lập offset ngày đầu tháng (Ví dụ bắt đầu từ thứ 4 -> 2 ô trống) */}
                    <div /><div />

                    {daysInMonth.map(day => {
                        const isToday = day === currentDay;
                        const isScheduled = scheduledDays.includes(day);
                        const isDone = doneDays.includes(day);

                        return (
                            <div key={day} className="flex justify-center items-center h-8">
                                <button
                                    className={cn(
                                        "flex items-center justify-center h-7 w-7 rounded-full text-sm font-medium transition-colors",
                                        isDone && "bg-[#36caf1] text-white", // Đã hoàn thành (Done) -> Xanh nước biển dương
                                        isScheduled && "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300", // Lên lịch -> Xám
                                        isToday && !isDone && !isScheduled && "border border-[#36caf1] text-[#36caf1]", // Ngày hiện tại
                                        !isDone && !isScheduled && !isToday && "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" // Ngày thường
                                    )}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Chú thích (Legend) */}
                <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full border border-[#36caf1]"></div>
                        <span>Hiện tại</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#36caf1]"></div>
                        <span>Đã làm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <span>Đã hẹn</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
