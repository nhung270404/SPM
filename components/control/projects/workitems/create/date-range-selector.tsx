'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";

interface DateRangeSelectorProps {
  startDate: Date | null;
  setStartDate: (val: Date | null) => void;
  endDate: Date | null;
  setEndDate: (val: Date | null) => void;
}

export function DateRangeSelector({ startDate, setStartDate, endDate, setEndDate }: DateRangeSelectorProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Start Date */}
      <Popover open={startOpen} onOpenChange={setStartOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
            <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
            {startDate ? format(startDate, "dd/MM") : "Bắt đầu"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 z-[100] shadow-2xl rounded-2xl overflow-hidden" align="start">
          <Calendar 
            mode="single" 
            selected={startDate || undefined} 
            onSelect={(d) => {
              setStartDate(d || null);
              setStartOpen(false);
            }} 
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            className="p-3"
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date */}
      <Popover open={endOpen} onOpenChange={setEndOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
            <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
            {endDate ? format(endDate, "dd/MM") : "Kết thúc"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 z-[100] shadow-2xl rounded-2xl overflow-hidden" align="start">
          <Calendar 
            mode="single" 
            selected={endDate || undefined} 
            onSelect={(d) => {
              setEndDate(d || null);
              setEndOpen(false);
            }} 
            disabled={(date) => {
              const baseDate = startDate || new Date();
              baseDate.setHours(0, 0, 0, 0);
              return date < baseDate;
            }}
            className="p-3"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
