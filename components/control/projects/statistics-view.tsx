'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  BarChart3, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, Users, Loader2, Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// --- INTERFACES ---
interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  memberCount: number;
  progressData: { name: string; completed: number; ongoing: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
  memberPerformance: { name: string; done: number; total: number; perf: string }[];
}

export function StatisticsView({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);

  // --- API CALL ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${projectId}/statistics`);
        setStats(response.data);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
        toast.error("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchStats();
  }, [projectId]);

  // --- XỬ LÝ XUẤT EXCEL ---
  const handleExportExcel = () => {
    if (!stats) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1
    const overviewData = [
      { "Chỉ số": "Tổng công việc", "Giá trị": stats.totalTasks },
      { "Chỉ số": "Đã hoàn thành", "Giá trị": stats.completedTasks },
      { "Chỉ số": "Đang thực hiện", "Giá trị": stats.inProgressTasks },
      { "Chỉ số": "Quá hạn", "Giá trị": stats.overdueTasks },
      { "Chỉ số": "Thành viên", "Giá trị": stats.memberCount },
    ];
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng quan");

    // Sheet 2
    const memberData = stats.memberPerformance.map(m => ({
      "Tên thành viên": m.name, "Đã xong": m.done, "Tổng task": m.total, "Đánh giá": m.perf
    }));
    const wsMembers = XLSX.utils.json_to_sheet(memberData);
    XLSX.utils.book_append_sheet(wb, wsMembers, "Hiệu suất");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Bao_cao_du_an_${projectId}_${dateStr}.xlsx`);
    toast.success("Đã xuất file Excel thành công!");
  };

  if (loading) {
    return (
      // Loading cũng phải full màn hình để không bị lệch layout
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">Analyzing data...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  // --- STYLES ---
  // Card chung cho Light/Dark
  const cardStyle = "bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md";
  const textTitle = "text-zinc-900 dark:text-white";
  const textSub = "text-zinc-500 dark:text-zinc-400";

  return (
    // [FIX QUAN TRỌNG]
    // 1. h-[calc(100vh-4rem)]: Chiều cao cố định bằng màn hình trừ Header web.
    // 2. overflow-hidden: Chặn thanh cuộn của trình duyệt.
    <div className="flex flex-col w-full bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white overflow-hidden h-[calc(100vh-5.1rem)]">

      {/* HEADER: Cố định (flex-none) */}
      <div className="flex-none p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a] z-10 shadow-sm dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-primary">❖</span> Thống kê Dự án
              <Badge variant="outline" className="ml-2 border-primary/30 text-primary dark:text-primary bg-cyan-50 dark:bg-cyan-500/10 text-[10px] h-5">Live</Badge>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Dữ liệu thời gian thực từ hệ thống.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>

            <Button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 px-4 gap-2 shadow-md border-0"
            >
              <Download className="h-3.5 w-3.5" /> Xuất Excel
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT: Cuộn riêng (flex-1 + overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-0">
        <div className="space-y-6 pb-10">

          {/* 1. OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tiến độ chung', value: `${completionRate}%`, sub: `${stats.completedTasks}/${stats.totalTasks} Task`, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
              { label: 'Đang thực hiện', value: `${stats.inProgressTasks}`, sub: 'Cần đẩy nhanh', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
              { label: 'Quá hạn / Rủi ro', value: `${stats.overdueTasks}`, sub: 'Cần xử lý gấp', icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
              { label: 'Thành viên', value: `${stats.memberCount}`, sub: 'Đang hoạt động', icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
            ].map((stat, i) => (
              <Card key={i} className={cardStyle}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                    <h3 className={`text-2xl font-bold ${textTitle}`}>{stat.value}</h3>
                    <p className={`text-[11px] ${textSub}`}>{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 2. CHARTS AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart */}
            <Card className={cn(cardStyle, "lg:col-span-2")}>
              <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className={`text-base font-bold ${textTitle} flex items-center gap-2`}>
                  <TrendingUp className="h-4 w-4 text-primary" /> Xu hướng hoàn thành
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[320px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.progressData}>
                    <defs>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#36caf1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#36caf1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area type="monotone" dataKey="completed" name="Hoàn thành" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
                    <Area type="monotone" dataKey="ongoing" name="Đang làm" stroke="#22d3ee" fillOpacity={0} strokeWidth={2} strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart Vertical */}
            <Card className={cardStyle}>
              <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className={`text-base font-bold ${textTitle} flex items-center gap-2`}>
                  <BarChart3 className="h-4 w-4 text-primary" /> Trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[320px] w-full flex flex-col pt-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.statusDistribution} layout="vertical" margin={{ left: 0, right: 30 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} width={80} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: 'transparent' }}>
                        {stats.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-2 space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {stats.statusDistribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium">{item.name}</span>
                      </div>
                      <span className={`font-bold font-mono ${textTitle}`}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. PERFORMANCE TABLE */}
          <Card className={cardStyle}>
            <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className={`text-base font-bold ${textTitle}`}>Hiệu suất thành viên</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/[0.02] uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-6 py-3">Thành viên</th>
                    <th className="px-6 py-3">Hoàn thành / Tổng</th>
                    <th className="px-6 py-3 w-1/3">Tiến độ</th>
                    <th className="px-6 py-3 text-right">Đánh giá</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {stats.memberPerformance.length > 0 ? stats.memberPerformance.map((user, i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className={`px-6 py-3 font-medium ${textTitle} flex items-center gap-3`}>
                        <Avatar className="h-7 w-7 border border-zinc-200 dark:border-white/10"><AvatarFallback className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200 text-[10px]">{user.name.charAt(0)}</AvatarFallback></Avatar>
                        {user.name}
                      </td>
                      <td className="px-6 py-3 text-zinc-600 dark:text-zinc-300 font-mono font-medium">{user.done} <span className="text-zinc-400">/ {user.total}</span></td>
                      <td className="px-6 py-3">
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: user.total > 0 ? `${(user.done/user.total)*100}%` : '0%' }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Badge variant="outline" className="font-normal text-[11px] border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-transparent shadow-sm">
                          {user.perf}
                        </Badge>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center py-8 text-zinc-500 italic">Chưa có dữ liệu</td></tr>
                  )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}