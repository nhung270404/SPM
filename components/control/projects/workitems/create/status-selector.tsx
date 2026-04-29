'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { STATUS_OPTIONS } from '../work-items-types';

interface StatusSelectorProps {
  status: string;
  setStatus: (val: string) => void;
}

export function StatusSelector({ status, setStatus }: StatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
          <selectedStatus.icon className={cn("h-3.5 w-3.5", selectedStatus.color)} />
          {selectedStatus.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
        <Command className="bg-transparent">
          <CommandList>
            <CommandGroup>
              {STATUS_OPTIONS.map((opt) => {
                const bgColors: Record<string, string> = {
                  'Backlog': 'hover:bg-slate-50 dark:hover:bg-slate-900/20 text-slate-600',
                  'Todo': 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-cyan-600',
                  'In Progress': 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600',
                  'Done': 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600',
                  'Cancel': 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600',
                };
                const isActive = status === opt.value;
                const activeClasses: Record<string, string> = {
                  'Backlog': 'bg-slate-100/80 dark:bg-slate-900/40 text-slate-700',
                  'Todo': 'bg-cyan-100/80 dark:bg-cyan-900/40 text-cyan-700',
                  'In Progress': 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700',
                  'Done': 'bg-green-100/80 dark:bg-green-900/40 text-green-700',
                  'Cancel': 'bg-red-100/80 dark:bg-red-900/40 text-red-700',
                };

                return (
                  <CommandItem 
                    key={opt.value} 
                    onSelect={() => {
                      setStatus(opt.value);
                      setOpen(false);
                    }} 
                    className={cn(
                      "cursor-pointer m-1 rounded-lg transition-colors flex items-center gap-2",
                      bgColors[opt.value],
                      isActive && activeClasses[opt.value]
                    )}
                  >
                    <opt.icon className={cn("h-3.5 w-3.5", opt.color)} />
                    <span className="font-medium text-xs">{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
