import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function StatusPieChart({ distribution }: { distribution: any[] }) {
  if (!distribution || distribution.length === 0) return null;

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl h-full">
      <CardHeader className="p-5">
        <CardTitle className="text-lg">Trạng thái công việc</CardTitle>
        <CardDescription className="text-xs">Tổng quan tình trạng task toàn dự án.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] p-5 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
