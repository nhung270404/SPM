'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Folder, Layout, Link as LinkIcon, Users, StickyNote, Save, Flame, Zap, Trophy, Target, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// --- GAMIFICATION PANEL ---
export function GamificationWidget() {
    const stats = {
        streak: 7,
        xp: 450,
        nextLevelXp: 1000,
        rank: 2,
        level: 'Chiến binh Agile',
        goalsDone: 12
    };

    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col relative overflow-hidden group">
            {/* Background Decoration */}
            <Trophy className="absolute -bottom-6 -right-6 h-32 w-32 text-amber-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            
            <div className="flex items-center gap-2 mb-5">
                <div className="h-1 w-4 bg-amber-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bảng vinh danh</span>
            </div>

            <div className="flex-1 space-y-5 z-10">
                {/* Level & XP */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-600" />
                            </div>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{stats.level}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{stats.xp} / {stats.nextLevelXp} XP</span>
                    </div>
                    <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-1.5 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500" />
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-2xl flex items-center gap-3 border border-rose-100/50 dark:border-rose-900/20">
                        <div className="p-2 bg-white dark:bg-rose-900/40 rounded-xl shadow-sm">
                            <Flame className="h-4 w-4 text-rose-500 fill-rose-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black text-rose-600 leading-none">{stats.streak}</span>
                            <span className="text-[8px] font-bold text-rose-400 uppercase tracking-tighter">Ngày Streak</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-2xl flex items-center gap-3 border border-blue-100/50 dark:border-blue-900/20">
                        <div className="p-2 bg-white dark:bg-blue-900/40 rounded-xl shadow-sm">
                            <Trophy className="h-4 w-4 text-blue-500 fill-blue-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black text-blue-600 leading-none">#{stats.rank}</span>
                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">Hạng Team</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-slate-500">Đã hoàn thành {stats.goalsDone} mục tiêu lớn</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
