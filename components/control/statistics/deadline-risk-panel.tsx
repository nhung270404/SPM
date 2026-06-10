import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Flame, Calendar, Info, ArrowUpRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RiskMetrics {
  atRiskTasks: number;
  severelyOverdue: number;
  dueThisWeek: number;
  delayRisk: number;
  aiInsight?: string;
}

export function DeadlineRiskPanel({ metrics }: { metrics: RiskMetrics }) {
  if (!metrics) return null;

  const getRiskColor = (risk: number) => {
    if (risk > 50) return 'text-rose-500';
    if (risk > 20) return 'text-orange-500';
    return 'text-cyan-500';
  };

  const getRiskBg = (risk: number) => {
    if (risk > 50) return 'bg-rose-500';
    if (risk > 20) return 'bg-orange-500';
    return 'bg-cyan-500';
  };

  return (
    <Card className="border-none shadow-xl bg-white dark:bg-slate-950/40 backdrop-blur-xl rounded-3xl overflow-hidden mb-8 border border-white/20 dark:border-white/5">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* LEFT: RISK GAUGE */}
          <div className="space-y-4">
            <div className="relative flex flex-col items-center justify-center py-4">
              <div className="text-center">
                <span className={`text-5xl font-black tracking-tighter ${getRiskColor(metrics.delayRisk)}`}>
                  {metrics.delayRisk}%
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nguy cơ chậm tiến độ</p>
              </div>
              <div className="w-full mt-6 space-y-3">
                 <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500 italic flex items-center gap-1">
                      ✨ Phân tích AI
                    </span>
                    <span className={getRiskColor(metrics.delayRisk)}>{metrics.delayRisk > 30 ? 'HIGH RISK' : 'STABLE STATUS'}</span>
                 </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic whitespace-pre-line">
                      "{metrics.aiInsight 
                        ? metrics.aiInsight.replace(/\s*Nguyên nhân:/gi, '\n\nNguyên nhân:').replace(/\s*Hành động:/gi, '\n\nHành động:') 
                        : 'Đang phân tích dữ liệu...'}"
                    </p>
                  </div>
                 <Progress 
                   value={metrics.delayRisk} 
                   className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full" 
                   indicatorClassName={`${getRiskBg(metrics.delayRisk)} transition-all duration-1000 ease-out`}
                 />
              </div>
            </div>
          </div>

          {/* RIGHT: RISK BREAKDOWN */}
          <div className="grid grid-cols-1 gap-3">
            {/* AT RISK */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10 group hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{metrics.atRiskTasks} task có nguy cơ trễ</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Hết hạn trong vòng 48 giờ tới</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-all" />
            </div>

            {/* SEVERELY OVERDUE */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 group hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{metrics.severelyOverdue} task overdue {'>'} 3 ngày</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Cần xử lý ngay lập tức (Critical)</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-rose-400 opacity-0 group-hover:opacity-100 transition-all" />
            </div>

            {/* DUE THIS WEEK */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 group hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{metrics.dueThisWeek} task due this week</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Khối lượng công việc cần hoàn thành</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
