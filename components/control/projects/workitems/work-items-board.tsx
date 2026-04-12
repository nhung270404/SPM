'use client';

import React from 'react';
import {DragDropContext, Droppable, Draggable, DropResult} from '@hello-pangea/dnd';
import {HelpCircle, Plus, MoreHorizontal, User, Triangle, GitMerge} from 'lucide-react';
import {format} from "date-fns";

import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Command, CommandList, CommandInput, CommandGroup, CommandItem} from '@/components/ui/command';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {cn} from '@/lib/utils';

import {Task, columns, STATUS_OPTIONS, mockMembers, estimates} from './work-items-types';

interface WorkItemsBoardProps {
    tasks: Task[];
    onDragEnd: (result: DropResult) => void;
    onSelectTask: (task: Task) => void;
    onEditTask: (task: Task) => void;
    onUpdateTask: (taskId: string, field: string, value: any) => void;
    onOpenCreateDialog: (status?: string) => void;
}

export function WorkItemsBoard({
                                   tasks,
                                   onDragEnd,
                                   onSelectTask,
                                   onEditTask,
                                   onUpdateTask,
                                   onOpenCreateDialog
                               }: WorkItemsBoardProps) {
    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    const STATUS_COLORS: Record<string, string> = {
        'Backlog': 'bg-slate-400',
        'Todo': 'bg-cyan-500',
        'In Progress': 'bg-blue-500',
        'Done': 'bg-green-500',
        'Cancel': 'bg-red-500',
    };

    const STATUS_BG_COLORS: Record<string, string> = {
        'Backlog': 'bg-slate-50/80 dark:bg-slate-900/10',
        'Todo': 'bg-cyan-50/80 dark:bg-cyan-900/10',
        'In Progress': 'bg-blue-50/80 dark:bg-blue-900/10',
        'Done': 'bg-green-50/80 dark:bg-green-900/10',
        'Cancel': 'bg-red-50/80 dark:bg-red-900/10',
    };

    const getParentInfo = (parentId: string) => {
        const parent = tasks.find(t => t._id === parentId);
        return parent ? `${parent.taskId} - ${parent.title}` : "Unknown Parent";
    };

    const stopProp = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation();
    };

// Debug check
    if (!columns || Object.keys(columns).length === 0) {
        return <div className="p-20 text-red-500">Error: Columns not found in types!</div>;
    }

    return (
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden bg-slate-50/50 dark:bg-transparent custom-scrollbar">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full p-6 pb-12 gap-5 w-max">
                    {Object.values(columns).map((col: any) => {
                        const Icon = col.icon;
                        const accentColor = STATUS_COLORS[col.id] || 'bg-slate-400';
                        return (
                            <div key={col.id} className="flex-none w-[320px] flex flex-col h-full relative">
                                {/* COLUMN STATUS ACCENT */}
                                <div className={cn("absolute top-0 left-0 right-0 h-1.5 rounded-full z-20 shadow-sm", accentColor)} />
                                
                                <div className="flex items-center justify-between mb-5 px-3 pt-7">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("p-1.5 rounded-lg bg-white dark:bg-white/5 shadow-sm border border-zinc-200/50 dark:border-white/5", col.color)}>
                                            <Icon className="h-4 w-4"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{col.title}</span>
                                            <span className="text-[9px] text-zinc-400 font-bold uppercase">{getTasksByStatus(col.id).length} công việc</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => onOpenCreateDialog(col.id)}
                                            className="h-8 w-8 text-zinc-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-white/5 rounded-xl transition-all">
                                        <Plus className="h-5 w-5"/>
                                    </Button>
                                </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 rounded-[1.5rem] backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 p-3 overflow-y-auto custom-scrollbar transition-all duration-300 relative",
                                            STATUS_BG_COLORS[col.id] || "bg-slate-50/50",
                                            snapshot.isDraggingOver ? "ring-2 ring-cyan-500/20 shadow-inner brightness-95" : ""
                                        )}>
                                        <div className="flex flex-col gap-3 min-h-full pb-10">
                                            {getTasksByStatus(col.id).length > 0 ? (
                                                getTasksByStatus(col.id).map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => onSelectTask(task)}
                                                            style={{...provided.draggableProps.style}}
                                                            className={cn(
                                                                "group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-500 cursor-pointer",
                                                                "bg-white dark:bg-[#1a1a1d] border-zinc-200/60 dark:border-white/10",
                                                                "hover:border-cyan-500/40 dark:hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-[1.02]",
                                                                snapshot.isDragging ? "shadow-2xl ring-2 ring-cyan-500/50 scale-105 z-50 rotate-1 opacity-100" : ""
                                                            )}>
                                                            <div className="flex flex-col gap-2">
                                                                {task.parentId && (
                                                                    <div
                                                                        className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold bg-zinc-100/80 dark:bg-white/5 px-2 py-1 rounded-lg w-fit mb-1 border border-zinc-200/30 dark:border-white/5">
                                                                        <GitMerge
                                                                            className="h-3.5 w-3.5 rotate-180 text-cyan-500"/>
                                                                        <span
                                                                            className="truncate max-w-[170px]">{getParentInfo(task.parentId)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between items-center">
                                                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono font-black group-hover:text-cyan-500 transition-colors tracking-widest">
                                                                    #{task.taskId}
                                                                </span>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button onClick={stopProp}
                                                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-all">
                                                                                <MoreHorizontal
                                                                                    className="h-4 w-4 text-zinc-400"/>
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent
                                                                            className="w-40 p-1.5 bg-white dark:bg-[#1a1a1d] border-zinc-200 dark:border-white/10 shadow-2xl z-[60]"
                                                                            align="end" onClick={stopProp}>
                                                                            <button
                                                                                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                                                                                onClick={() => onEditTask(task)}>
                                                                                ✏️ Chỉnh sửa
                                                                            </button>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                                {task.title}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2.5 pt-2"
                                                                 onClick={stopProp}>
                                                                {/* Status - Now with more chip-like look */}
                                                                <Popover modal={true}>
                                                                    <PopoverTrigger asChild>
                                                                        <button
                                                                            className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600 dark:text-zinc-300 bg-zinc-100/50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-zinc-200/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm">
                                                                            {(() => {
                                                                                const sInfo = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[1];
                                                                                const StatusIcon = sInfo.icon;
                                                                                return <>
                                                                                    <StatusIcon
                                                                                        className={cn("h-3.5 w-3.5", sInfo.color)}/>
                                                                                    <span>{sInfo.label}</span></>
                                                                            })()}
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent
                                                                        className="p-1 w-[200px] bg-white dark:bg-[#1a1a1d] border-zinc-200 dark:border-white/10 shadow-2xl z-[60]"
                                                                        align="start">
                                                                        <Command className="bg-transparent">
                                                                            <CommandList>
                                                                                <CommandGroup>
                                                                                    {STATUS_OPTIONS.map(opt => (
                                                                                        <CommandItem key={opt.value}
                                                                                                     onSelect={() => onUpdateTask(task._id, 'status', opt.value)}
                                                                                                     className="hover:bg-zinc-100 dark:hover:bg-white/10 text-xs cursor-pointer rounded-lg mb-0.5">
                                                                                            <opt.icon
                                                                                                className={cn("mr-2 h-4 w-4", opt.color)}/>
                                                                                            {opt.label}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>

                                                                {/* Assignee */}
                                                                <Popover modal={true}>
                                                                    <PopoverTrigger asChild>
                                                                        <button className={cn(
                                                                            "flex items-center gap-2 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all shadow-sm",
                                                                            task.assignee ? "text-zinc-700 dark:text-zinc-300 bg-zinc-100/50 dark:bg-white/5 border-zinc-200/50 dark:border-white/5" : "text-zinc-400 border-dashed border-zinc-300 dark:border-zinc-800"
                                                                        )}>
                                                                            <User className="h-3.5 w-3.5"/>
                                                                            <span
                                                                                className="truncate max-w-[80px]">{task.assignee ? task.assignee.name : "Chưa gán"}</span>
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent
                                                                        className="p-1 w-[220px] bg-white dark:bg-[#1a1a1d] border-zinc-200 dark:border-white/10 shadow-2xl z-[60]"
                                                                        align="start">
                                                                        <Command className="bg-transparent">
                                                                            <CommandInput
                                                                                placeholder="Tìm thành viên..."
                                                                                className="h-9 border-none text-xs"/>
                                                                            <CommandList>
                                                                                <CommandGroup>
                                                                                    {mockMembers.map(m => (
                                                                                        <CommandItem key={m.id}
                                                                                                     onSelect={() => onUpdateTask(task._id, 'assignee', m)}
                                                                                                     className="hover:bg-zinc-100 dark:hover:bg-white/10 text-xs cursor-pointer rounded-lg mb-0.5">
                                                                                            <Avatar
                                                                                                className="h-5 w-5 mr-2"><AvatarImage
                                                                                                src={m.avatar}/><AvatarFallback
                                                                                                className="text-[10px] font-black">{m.name[0]}</AvatarFallback></Avatar>
                                                                                            {m.name}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>

                                                                <div className="ml-auto flex items-center gap-2">
                                                                    {task.estimate && (
                                                                        <div
                                                                            className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-200/50 dark:border-blue-500/20">
                                                                            <Triangle className="h-3 w-3 fill-current opacity-50"/>
                                                                            <span>{task.estimate}h</span>
                                                                        </div>
                                                                    )}
                                                                    {task.endDate && (
                                                                        <div
                                                                            className="text-[10px] font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-200/50 dark:border-rose-500/20">
                                                                            {format(new Date(task.endDate), "dd/MM")}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                                ))
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200/50 dark:border-white/5 rounded-3xl min-h-[200px] mt-2 group/empty transition-all hover:border-cyan-500/20">
                                                    <div className="p-4 rounded-full bg-zinc-50 dark:bg-white/5 mb-3 group-hover/empty:scale-110 transition-transform">
                                                        <HelpCircle className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                                        Chưa có công việc
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
