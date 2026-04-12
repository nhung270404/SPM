"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Zap, AlertCircle, CheckCircle2, Clock, CalendarCheck } from "lucide-react";

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
    },
    {
        id: 6,
        title: "Chờ phê duyệt",
        value: "14",
        icon: Clock,
        textColor: "text-indigo-500",
        bgIcon: "bg-indigo-100 dark:bg-indigo-900/40"
    }
];

export function ProjectActivityWidget() {
    return (
        <div className="flex flex-col gap-5 w-full h-full">
            <div className="flex items-center justify-between px-2 mb-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Tổng quan Dự án
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 xl:gap-6 flex-1">
                {SUMMARY_DATA.map((item) => (
                    <Card
                        key={item.id}
                        // Thẻ mặc định có nền trắng, viền nhạt. Khi hover viền đổi sang màu xanh Cyan (#03bdd8)
                        className={`group shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.5rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-[#03bdd8] dark:hover:border-[#03bdd8] relative overflow-hidden h-full cursor-default`}
                    >
                        <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full min-h-[150px] relative z-10">
                            <div className="flex justify-between items-start">
                                {/* Khối Icon luôn luôn giữ màu đặc trưng ngay cả khi không hover */}
                                <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 ${item.bgIcon}`}>
                                    <item.icon className={`w-6 h-6 md:w-7 md:h-7 ${item.textColor}`} />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <h4 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-transform duration-300">
                                    {item.value}
                                </h4>
                                <p className="text-sm md:text-base font-medium text-slate-500 mt-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                    {item.title}
                                </p>
                            </div>

                            {/* Icon trang trí mờ ở góc - Cũng mang màu đặc trưng */}
                            <item.icon className={`absolute -bottom-4 -right-4 w-28 h-28 opacity-5 transition-all duration-500 scale-90 group-hover:rotate-12 group-hover:scale-100 group-hover:opacity-10 ${item.textColor}`} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
