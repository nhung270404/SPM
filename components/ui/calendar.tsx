'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={vi}
      showOutsideDays={showOutsideDays}
      className={cn('py-3 px-8', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        caption: 'flex justify-center pt-2 relative items-center w-full mb-4',
        caption_label: 'text-sm font-bold text-zinc-800 dark:text-zinc-100',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'size-9 bg-transparent p-0 opacity-50 hover:opacity-100 border-none absolute left-0 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'size-9 bg-transparent p-0 opacity-50 hover:opacity-100 border-none absolute right-0 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-zinc-400 dark:text-zinc-500 rounded-md w-9 font-bold text-[10px] uppercase tracking-wider',
        week: 'flex w-full mt-2',
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent h-9 w-9 flex items-center justify-center',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-full'
        ),
        day_button: cn(
          'size-8 p-0 font-bold transition-all duration-200 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/10 aria-selected:opacity-100'
        ),
        range_start: 'day-range-start rounded-l-full aria-selected:bg-[#36caf1] aria-selected:text-white',
        range_end: 'day-range-end rounded-r-full aria-selected:bg-[#36caf1] aria-selected:text-white',
        selected: 'rounded-full bg-[#36caf1] text-white hover:bg-[#36caf1]/90 focus:bg-[#36caf1] focus:text-white shadow-md z-10',
        today: 'rounded-full border-2 border-[#36caf1] text-[#36caf1] font-black scale-105 z-10',
        outside: 'day-outside text-muted-foreground opacity-20 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
        range_middle: 'aria-selected:bg-zinc-100 dark:aria-selected:bg-white/5 aria-selected:text-zinc-900 dark:aria-selected:text-white',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="size-4" />;
          }
          return <ChevronRight className="size-4" />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
