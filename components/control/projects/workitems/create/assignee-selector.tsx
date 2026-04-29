'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AssigneeSelectorProps {
  assignee: any;
  setAssignee: (val: any) => void;
  members: any[];
}

export function AssigneeSelector({ assignee, setAssignee, members }: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
          <User className="h-3.5 w-3.5 text-zinc-500" />
          {assignee ? assignee.name : "Assignee"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[220px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder="Tìm kiếm thành viên..." className="h-9 border-none focus:ring-0" />
          <CommandList>
            <CommandGroup>
              {members.map(m => (
                <CommandItem 
                  key={m._id} 
                  onSelect={() => {
                    setAssignee(m);
                    setOpen(false);
                  }} 
                  className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <Avatar className="h-5 w-5 mr-3 border border-zinc-100 dark:border-white/5">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase">
                      {m.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{m.name}</span>
                </CommandItem>
              ))}
              {members.length === 0 && (
                <CommandEmpty className="py-6 text-center text-zinc-500 text-xs text-muted-foreground italic">
                  Chưa có thành viên trong dự án
                </CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
