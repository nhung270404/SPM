'use client';

import React, { useState, useEffect } from 'react';
import { StickyNote, Save, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// --- TEAM STATUS COMPONENT ---
export function TeamStatusWidget() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/user/list');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMembers(data);
                }
            } catch (e) {
                console.error('Failed to fetch users:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-4 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái nhóm</span>
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <div className="flex -space-x-3 overflow-hidden p-1">
                    {members.slice(0, 5).map((m, i) => (
                        <TooltipProvider key={i}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Avatar className="border-2 border-white dark:border-slate-900 h-10 w-10 cursor-help">
                                        <AvatarImage src={m.avatar} />
                                        <AvatarFallback className={cn("text-white text-xs font-bold bg-slate-400")}>
                                            {m.firstname?.[0] || m.lastname?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">{m.firstname} {m.lastname}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                    {members.length > 5 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] font-bold text-slate-500">
                            +{members.length - 5}
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-2xl">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                        {members.length} Thành viên
                    </span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

// --- COMPACT SCRATCHPAD COMPONENT ---
export function CompactScratchPad() {
    const [note, setNote] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('dashboard_scratchpad');
        if (saved) setNote(saved);
    }, []);

    const handleChange = (val: string) => {
        setNote(val);
        localStorage.setItem('dashboard_scratchpad', val);
    };

    return (
        <div className="bg-[#fefce8] dark:bg-amber-950/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/50 shadow-sm h-full flex flex-col relative group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">Ghi chú</span>
                </div>
                <div className="flex items-center gap-1">
                     <span className="text-[9px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase">Tự động lưu</span>
                     <Save className="h-3 w-3 text-amber-600 opacity-50" />
                </div>
            </div>
            <textarea 
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-amber-100/80 text-xs font-medium placeholder:text-amber-800/30 dark:placeholder:text-amber-100/20 resize-none custom-scrollbar"
                placeholder="Ý tưởng hôm nay..."
                value={note}
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    );
}
