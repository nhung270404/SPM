'use client';

import React, { useState } from 'react';
import { Triangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { estimates } from '../work-items-types';

interface EstimateSelectorProps {
  estimate: number | null;
  setEstimate: (val: number | null) => void;
}

export function EstimateSelector({ estimate, setEstimate }: EstimateSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
          <Triangle className="h-3.5 w-3.5 text-zinc-500" />
          {(estimate !== null && estimate !== undefined) ? (estimate === -1 ? "K.Giới hạn" : `${estimate}h`) : "Est"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-2 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-[100] shadow-xl" align="start">
        <div className="flex flex-wrap gap-1">
          {estimates.map(est => (
            <div 
              key={est} 
              onClick={() => {
                setEstimate(est);
                setOpen(false);
              }} 
              className="px-2 py-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 rounded cursor-pointer transition-colors whitespace-nowrap"
            >
              {est === -1 ? <span className="text-xs font-bold">∞</span> : `${est}h`}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
