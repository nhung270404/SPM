import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function TeamVelocityChart({ members }: { members: any[] }) {
  if (!members || members.length === 0) return null;

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl mb-8">
      <CardHeader className="p-5">
        <CardTitle className="text-lg">Tốc độ hoàn thành nhóm</CardTitle>
        <CardDescription className="text-xs">So sánh khối lượng công việc Đã hoàn thành và Đang thực hiện.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] p-5 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={members}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500 }} dx={-10} />
            <Tooltip 
              cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
            />
            <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="completed" name="Đã hoàn thành" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={25} />
            <Bar dataKey="inProgress" name="Đang thực hiện" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
