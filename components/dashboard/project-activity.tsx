"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Zap, AlertCircle, CheckCircle2, Clock, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Định nghĩa màu sắc cố định cho từng thẻ
const SUMMARY_DATA = [
    {
        id: 1,
        title: "Tổng số dự án",
        value: "123",
        icon: Briefcase,
        textColor: "text-blue-500",
        bgIcon: "bg-blue-100 dark:bg-blue-900/40"
    },
    {
        id: 2,
        title: "Dự án đang làm",
        value: "45",
        icon: Zap,
        textColor: "text-cyan-500",
        bgIcon: "bg-cyan-100 dark:bg-cyan-900/40"
    },
    {
        id: 3,
        title: "Đã hoàn thành",
        value: "92",
        icon: CheckCircle2,
        textColor: "text-emerald-500",
        bgIcon: "bg-emerald-100 dark:bg-emerald-900/40"
    },
    {
        id: 4,
        title: "Chậm tiến độ",
        value: "67",
        icon: AlertCircle,
        textColor: "text-rose-500",
        bgIcon: "bg-rose-100 dark:bg-rose-900/40"
    },
    {
        id: 5,
        title: "Kịp thời hạn",
        value: "58",
        icon: CalendarCheck,
        textColor: "text-teal-500",
        bgIcon: "bg-teal-100 dark:bg-teal-900/40"
    }
];

export function ProjectActivityWidget() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 mb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-6 bg-[#36caf1] rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#36caf1]">Phân tích dữ liệu</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Tổng quan Dự án
                    </h3>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
                {SUMMARY_DATA.map((item) => (
                    <Card
                        key={item.id}
                        className="group relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] min-h-[160px] overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-500 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-[#36caf1]/15 hover:border-[#36caf1]/50"
                    >
                        {/* Glassmorphism Subtle Inner Border */}
                        <div className="absolute inset-0 border border-white/40 dark:border-white/5 rounded-[2rem] pointer-events-none" />
                        
                        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                            {/* Icon Section with Gradient Background */}
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                                    item.bgIcon
                                )}>
                                    <item.icon className={cn("w-6 h-6 md:w-7 md:h-7 drop-shadow-md", item.textColor)} />
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-all duration-500 group-hover:tracking-normal group-hover:text-[#36caf1]">
                                    {item.value}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                        {item.title}
                                    </p>
                                    <div className="h-px w-0 bg-[#36caf1]/30 group-hover:w-8 transition-all duration-500" />
                                </div>
                            </div>

                            {/* Large Background Decoration Icon */}
                            <item.icon className={cn(
                                "absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] transition-all duration-700 scale-90 rotate-12 group-hover:rotate-[-5deg] group-hover:scale-110 group-hover:opacity-[0.08]",
                                item.textColor
                            )} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
