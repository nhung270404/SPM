'use client';

import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskContentFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  isSubTask: boolean;
}

export function TaskContentFields({ title, setTitle, description, setDescription, isSubTask }: TaskContentFieldsProps) {
  return (
    <div className="px-6 py-6 min-h-[220px] space-y-6">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-transparent border-none text-xl font-semibold px-0 placeholder:text-zinc-400 focus-visible:ring-0 shadow-none h-auto py-2"
        placeholder={isSubTask ? "Nhập tên công việc con..." : "Tiêu đề công việc..."}
        autoFocus
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-transparent border-none text-sm text-zinc-700 dark:text-zinc-300 px-0 placeholder:text-zinc-400 focus-visible:ring-0 shadow-none resize-none min-h-[120px] leading-relaxed"
        placeholder="Thêm mô tả chi tiết..."
      />
    </div>
  );
}
