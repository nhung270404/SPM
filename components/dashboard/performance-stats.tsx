"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Medal, Trophy } from "lucide-react";

const curveData = [
    { day: "Mon", score: 40 },
    { day: "Tue", score: 30 },
    { day: "Wed", score: 80 },
    { day: "Thu", score: 45 },
    { day: "Fri", score: 70 },
    { day: "Sat", score: 50 },
    { day: "Sun", score: 90 },
];

export function PerformanceCurveWidget() {
    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Hiệu suất</h3>
                </div>
            </div>

            <div className="h-[180px] w-full mt-2 bg-white/40 dark:bg-slate-900/40 rounded-2xl p-4 shadow-sm border border-white/50 dark:border-slate-800/50">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curveData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#36caf1" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickMargin={12}
                            interval={0}
                        />
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white px-3 py-1 rounded-full shadow-md border border-slate-100 flex items-center justify-center -mt-8 font-bold text-slate-800">
                                            {payload[0].value}%
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="url(#gradientLine)"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "#0ea5e9" }}
                            activeDot={{ r: 6, fill: "#03bdd8", stroke: "white", strokeWidth: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function PerformanceStatsWidget() {
    return (
        <div className="flex flex-col gap-4 w-full h-full justify-center">
            {/* 2. Phần Dữ liệu Số (Data Stats) */}
            <div className="flex flex-col mt-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Dữ liệu</h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* Vòng tròn phần trăm bên trái */}
                    <Card className="rounded-2xl border-none shadow-sm flex flex-col items-center justify-center p-6 min-h-[160px] relative overflow-hidden bg-white/60 dark:bg-slate-900/60">
                        <div className="relative flex items-center justify-center">
                            {/* SVG Circle Progress */}
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <circle
                                    cx="48" cy="48" r="36"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray="226.2" // 2 * PI * 36
                                    strokeDashoffset={226.2 - (226.2 * 60) / 100} // 60%
                                    strokeLinecap="round"
                                    className="text-[#03bdd8]"
                                />
                            </svg>
                            <span className="absolute text-xl font-extrabold text-slate-800 dark:text-white">60%</span>

                            {/* Vài icon trang trí li ti quanh vòng tròn */}
                            <div className="absolute top-0 -left-2 w-2 h-2 rounded-sm bg-yellow-300 -rotate-12" />
                            <div className="absolute top-2 -right-1 w-1 h-3 rounded-full bg-orange-300 rotate-45" />
                            <div className="absolute bottom-2 -right-2 w-2 h-2 rounded-full bg-cyan-300" />
                        </div>
                        <p className="text-xs text-slate-500 mt-4 text-center font-medium">Cao hơn hầu hết mọi người!</p>
                    </Card>

                    {/* Các thẻ con bên phải */}
                    <div className="flex flex-col gap-4">
                        {/* Thẻ 1: Ranking */}
                        <Card className="rounded-2xl border-none shadow-sm flex-1 flex flex-col justify-center p-4 bg-white/60 dark:bg-slate-900/60 relative">
                            <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">15</h4>
                            <p className="text-xs text-slate-500 font-medium">Xếp hạng</p>
                            <div className="absolute top-4 right-4 text-cyan-500">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </Card>
                        {/* Thẻ 2: Progress */}
                        <Card className="rounded-2xl border-none shadow-sm flex-1 flex flex-col justify-center p-4 bg-white/60 dark:bg-slate-900/60 relative">
                            <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">60%</h4>
                            <p className="text-xs text-slate-500 font-medium">Tiến độ</p>
                            <div className="absolute top-4 right-4 text-cyan-500">
                                <Medal className="h-5 w-5" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
