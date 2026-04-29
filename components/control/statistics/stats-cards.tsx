import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'cyan' | 'green' | 'blue' | 'red';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorMap = {
    cyan: 'bg-cyan-500/10 text-cyan-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    red: 'bg-red-500/10 text-red-600',
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900/50 rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white leading-none mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ summary }: { summary: any }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Tổng Task" value={summary.totalTasks} icon={Target} color="cyan" />
      <StatCard title="Đã Hoàn Thành" value={summary.completedTasks} icon={CheckCircle2} color="green" />
      <StatCard title="Hiệu suất" value={summary.efficiencyRate} icon={TrendingUp} color="blue" />
      <StatCard title="Task Quá Hạn" value={summary.overdueTasks} icon={AlertCircle} color="red" />
    </div>
  );
}
