import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function StatusPieChart({ distribution }: { distribution: any[] }) {
  if (!distribution || distribution.length === 0) return null;

  // Sắp xếp theo thứ tự cột của dự án
  const order = ['Backlog', 'Todo', 'In Progress', 'Done', 'Cancel'];
  const sortedDistribution = [...distribution].sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl h-full">
      <CardHeader className="p-5">
        <CardTitle className="text-lg">Trạng thái công việc</CardTitle>
        <CardDescription className="text-xs">Tổng quan tình trạng task toàn dự án.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] p-5 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
