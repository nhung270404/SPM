import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MemberStats {
  id: string;
  name: string;
  completed: number;
  inProgress: number;
  efficiency: number;
  avatar: string;
}

export function MemberLeaderboard({ members }: { members: MemberStats[] }) {
  return (
    <Card className="bg-white/50 dark:bg-slate-950/40 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/10 dark:shadow-none h-full">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
           <Users className="h-4 w-4 text-cyan-500" />
           Tiến độ thành viên
        </CardTitle>
        <CardDescription className="text-xs">Theo dõi mức độ hoàn thành công việc của từng thành viên trong dự án.</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="space-y-6 mt-4">
          {members && members.length > 0 ? (
            members.map((member) => (
              <div key={member.id} className="group transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-xl border border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                        <AvatarFallback className="bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400 font-bold text-xs uppercase">
                          {member.avatar}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 transition-colors line-clamp-1">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {member.completed} đã xong • {member.inProgress} đang làm
                        </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-600">{member.efficiency}%</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Hoàn thành</p>
                  </div>
                </div>
                <Progress value={member.efficiency} className="h-1.5 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-gradient-to-r from-cyan-400 to-blue-500" />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
               <Users className="h-8 w-8 mb-2" />
               <p className="text-xs font-bold">Chưa có thành viên nào được giao việc</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
