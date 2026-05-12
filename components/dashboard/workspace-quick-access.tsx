'use client';

import React from 'react';
import { FileText, Folder, Layout, Link as LinkIcon, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const QUICK_LINKS = [
    { name: 'Sơ đồ UML', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { name: 'Đặc tả UC 7.1', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { name: 'Tài liệu Shopee', icon: Folder, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { name: 'Link họp nhóm', icon: LinkIcon, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
];

const TEAM_MEMBERS = [
    { name: 'Nguyễn Văn A', avatar: '', initial: 'A', color: 'bg-blue-500' },
    { name: 'Trần Thị B', avatar: '', initial: 'B', color: 'bg-emerald-500' },
    { name: 'Lê Văn C', avatar: '', initial: 'C', color: 'bg-purple-500' },
    { name: 'Phạm Minh D', avatar: '', initial: 'D', color: 'bg-rose-500' },
];

export function WorkspaceQuickAccess() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Quick Access */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-4 bg-[#36caf1] rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Truy cập nhanh</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {QUICK_LINKS.map((link, i) => (
                        <TooltipProvider key={i}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className={`flex flex-col items-center justify-center p-3 rounded-2xl ${link.bg} hover:scale-105 transition-transform cursor-pointer`}>
                                        <link.icon className={`h-5 w-5 ${link.color}`} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-bold">{link.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </div>

            {/* Team Presence */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-1 w-4 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái nhóm</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-3 overflow-hidden">
                        {TEAM_MEMBERS.map((member, i) => (
                            <Avatar key={i} className="inline-block border-2 border-white dark:border-slate-900 h-9 w-9">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className={`${member.color} text-white text-[10px] font-bold`}>
                                    {member.initial}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] font-bold text-slate-500">
                            +2
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
