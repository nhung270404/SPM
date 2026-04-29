'use client';

import React from 'react';
import {DragDropContext, Droppable, Draggable, DropResult} from '@hello-pangea/dnd';
import {HelpCircle, Plus, MoreHorizontal, User, Triangle, GitMerge, Calendar as CalendarIcon, Clock} from 'lucide-react';
import {format} from "date-fns";

import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Command, CommandList, CommandInput, CommandGroup, CommandItem, CommandEmpty} from '@/components/ui/command';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {cn} from '@/lib/utils';

import {Task, columns, STATUS_OPTIONS, estimates} from './work-items-types';

interface WorkItemsBoardProps {
    tasks: Task[];
    members: any[];
    onDragEnd: (result: DropResult) => void;
    onSelectTask: (task: Task) => void;
    onEditTask: (task: Task) => void;
    onUpdateTask: (taskId: string, field: string, value: any) => void;
    onOpenCreateDialog: (status?: string) => void;
}

export function WorkItemsBoard({
                                   tasks,
                                   members,
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
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden bg-slate-50/50 dark:bg-transparent no-scrollbar">
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
                                            "flex-1 rounded-[1.5rem] border border-zinc-200/50 dark:border-white/5 p-3 overflow-y-auto no-scrollbar transition-colors duration-300 relative",
                                            STATUS_BG_COLORS[col.id] || "bg-slate-50/50",
                                            snapshot.isDraggingOver ? "ring-2 ring-cyan-500/20 shadow-inner" : ""
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
                                                            style={provided.draggableProps.style}
                                                            className={cn(
                                                                "group relative flex flex-col gap-3 p-4.5 rounded-[1.5rem] border cursor-pointer",
                                                                "bg-white/80 dark:bg-[#1a1a1d]/80 border-zinc-200/50 dark:border-white/5",
                                                                "hover:border-cyan-500/20 dark:hover:border-white/10 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
                                                                !snapshot.isDragging && "hover:scale-[1.01] transition-[border-color,box-shadow,background-color,transform] duration-300",
                                                                snapshot.isDragging ? "shadow-2xl ring-2 ring-cyan-500/30 z-50 opacity-100 cursor-grabbing bg-white dark:bg-[#1a1a1d]" : ""
                                                            )}>
                                                            
                                                            {/* Card Header: ID & Parent */}
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex flex-col gap-0.5">
                                                                    {task.parentId && (
                                                                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 dark:text-zinc-400 font-bold bg-zinc-100/50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-zinc-200/20 dark:border-white/5 w-fit">
                                                                            <GitMerge className="h-2.5 w-2.5 rotate-180 text-cyan-500/70" />
                                                                            <span className="truncate max-w-[120px]">{getParentInfo(task.parentId)}</span>
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono font-black group-hover:text-cyan-500 transition-colors tracking-widest uppercase">
                                                                        #{task.taskId}
                                                                    </span>
                                                                </div>
                                                                
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button onClick={stopProp} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-400">
                                                                            <MoreHorizontal className="h-3.5 w-3.5"/>
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-40 p-1.5 bg-white/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl z-[60] rounded-xl" align="end" onClick={stopProp}>
                                                                        <button className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-zinc-700 dark:text-zinc-300" onClick={() => onEditTask(task)}>
                                                                            ✏️ Chỉnh sửa
                                                                        </button>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>

                                                            {/* Card Body: Title */}
                                                            <h3 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                                {task.title}
                                                            </h3>

                                                            {/* Card Footer: Single Row Metadata (One Line) */}
                                                            <div className="flex items-center gap-1 pt-1" onClick={stopProp}>
                                                                <Popover modal={false}>
                                                                    <PopoverTrigger asChild>
                                                                        <button className={cn(
                                                                            "flex items-center justify-center gap-1 text-[9px] font-bold px-1 h-7 min-w-[70px] rounded-full border transition-all shadow-sm bg-white dark:bg-white/5 border-zinc-200/60 dark:border-white/5 hover:border-cyan-500/20"
                                                                        )}>
                                                                            {(() => {
                                                                                const sInfo = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[1];
                                                                                const StatusIcon = sInfo.icon;
                                                                                return <><StatusIcon className={cn("h-2.5 w-2.5", sInfo.color)}/><span>{sInfo.label}</span></>
                                                                            })()}
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="p-1 w-[180px] bg-white/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl z-[60] rounded-xl" align="start">
                                                                        <Command className="bg-transparent">
                                                                            <CommandList>
                                                                                <CommandGroup>
                                                                                    {STATUS_OPTIONS.map(opt => (
                                                                                        <CommandItem key={opt.value} onSelect={() => onUpdateTask(task._id, 'status', opt.value)} className="hover:bg-zinc-100 dark:hover:bg-white/10 text-[11px] font-bold cursor-pointer rounded-lg mb-0.5 p-1.5 transition-all">
                                                                                            <opt.icon className={cn("mr-2 h-3.5 w-3.5", opt.color)}/>{opt.label}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>

                                                                <Popover modal={false}>
                                                                    <PopoverTrigger asChild>
                                                                        <button className={cn(
                                                                            "flex items-center justify-center h-7 w-7 rounded-full border transition-all shrink-0 p-0.5",
                                                                            (task.assignee && typeof task.assignee === 'object' && task.assignee.name) ? "bg-zinc-100/30 dark:bg-white/5 border-zinc-200/50 dark:border-white/10" : "border-dashed border-zinc-300 dark:border-white/10 text-zinc-400"
                                                                        )}>
                                                                            {task.assignee && typeof task.assignee === 'object' && task.assignee.name ? (
                                                                                <Avatar className="h-full w-full border border-white dark:border-white/10">
                                                                                    <AvatarImage src={task.assignee.avatar} />
                                                                                    <AvatarFallback className="bg-cyan-500 text-white text-[7px] font-black uppercase">{task.assignee.name.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                            ) : (
                                                                                <User className="h-2.5 w-2.5 text-zinc-400" />
                                                                            )}
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="p-1 w-[200px] bg-white/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl z-[60] rounded-xl" align="start">
                                                                        <Command className="bg-transparent">
                                                                            <CommandInput placeholder="Tìm thành viên..." className="h-8 border-none text-[11px] font-medium" />
                                                                            <CommandList className="max-h-[200px]">
                                                                                <CommandGroup>
                                                                                    {members.map(m => (
                                                                                        <CommandItem key={m._id} onSelect={() => onUpdateTask(task._id, 'assignee', m)} className="hover:bg-zinc-100 dark:hover:bg-white/10 text-[11px] font-bold cursor-pointer rounded-lg mb-0.5 p-1.5 transition-all">
                                                                                            <Avatar className="h-6 w-6 mr-2.5 ring-1 ring-zinc-200 dark:ring-white/10">
                                                                                                <AvatarImage src={m.avatar}/>
                                                                                                <AvatarFallback className="bg-cyan-500 text-white text-[8px] font-black uppercase">{m.name?.charAt(0)}</AvatarFallback>
                                                                                            </Avatar>
                                                                                            <span>{m.name}</span>
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>

                                                                <div className={cn(
                                                                    "flex items-center justify-center gap-1 h-7 px-1 rounded-lg border text-[9px] font-bold transition-all bg-white dark:bg-white/5 min-w-[40px]",
                                                                    (task.estimate !== null && task.estimate !== undefined) ? "text-zinc-700 dark:text-zinc-300 border-blue-500/30 dark:border-blue-500/40" : "text-zinc-400 border-dashed border-zinc-200 dark:border-white/5"
                                                                )}>
                                                                    <Triangle className={cn("h-2 w-2 fill-blue-500 text-blue-500", (task.estimate === null || task.estimate === undefined) && "opacity-30 grayscale")}/>
                                                                    <span className="truncate">{(task.estimate !== null && task.estimate !== undefined) ? (task.estimate === -1 ? <span className="text-xs">∞</span> : `${task.estimate}h`) : "Est"}</span>
                                                                </div>

                                                                <div className={cn(
                                                                    "flex items-center justify-center gap-0.5 h-7 px-1 rounded-lg border text-[9px] font-bold transition-all bg-white dark:bg-white/5 min-w-[52px]",
                                                                    task.startDate ? "text-zinc-700 dark:text-zinc-300 border-emerald-500/30 dark:border-emerald-500/40" : "text-zinc-400 border-dashed border-zinc-200 dark:border-white/5"
                                                                )}>
                                                                    <CalendarIcon className={cn("h-2 w-2 text-emerald-500", !task.startDate && "opacity-30 grayscale")}/>
                                                                    <span className="truncate">{task.startDate ? format(new Date(task.startDate), "dd/MM") : "Start"}</span>
                                                                </div>

                                                                <div className={cn(
                                                                    "flex items-center justify-center gap-0.5 h-7 px-1 rounded-lg border text-[9px] font-bold transition-all bg-white dark:bg-white/5 min-w-[52px]",
                                                                    task.endDate ? "text-zinc-700 dark:text-zinc-300 border-rose-500/30 dark:border-rose-500/40" : "text-zinc-400 border-dashed border-zinc-200 dark:border-white/5"
                                                                )}>
                                                                    <Clock className={cn("h-2 w-2 text-rose-500", !task.endDate && "opacity-30 grayscale")}/>
                                                                    <span className="truncate">{task.endDate ? format(new Date(task.endDate), "dd/MM") : "Due"}</span>
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
