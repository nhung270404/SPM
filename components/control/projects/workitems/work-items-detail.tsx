'use client';

import React, { useState, useRef } from 'react';
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from 'sonner';

// Icons
import {
    User, Calendar as CalendarIcon, Triangle,
    LayoutGrid, Paperclip, ChevronLeft, GitMerge,
    Bold, Italic, Underline, Image as ImageIcon,
    List, MoreHorizontal, ChevronDown, ChevronRight as ChevronRightIcon,
    FilePlus, RefreshCw, MessageSquare, UserPlus, Circle, X
} from 'lucide-react';

// UI
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Types and Shared Data
import {
    Task, columns, estimates, STATUS_OPTIONS
} from './work-items-types';

// --- TYPES FOR ACTIVITY ---
export type ActivityType = 'create' | 'assign' | 'state' | 'comment' | 'other';
export interface Activity {
    id: string;
    type: ActivityType;
    user: any;
    content: string;
    timestamp: Date;
}

// --- EXPORTED HELPER: ATTRIBUTE BUTTON ---
export const AttributeButton = ({
                                    icon: Icon, label, valueDisplay, content, isActive = false, className, onClick, showTooltip = true
                                }: {
    icon: any, label: string, valueDisplay: React.ReactNode, content: React.ReactNode, isActive?: boolean, className?: string, onClick?: () => void, showTooltip?: boolean
}) => {
    const [open, setOpen] = useState(false);
    const ButtonContent = (
        <PopoverTrigger asChild>
            <button
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                    "h-8 px-3 text-xs font-bold rounded-lg flex items-center gap-2 transition-all select-none border whitespace-nowrap shadow-sm",
                    isActive ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400" : "bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-cyan-500/30",
                    className
                )}
            >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{valueDisplay}</span>
            </button>
        </PopoverTrigger>
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {showTooltip ? (
                <Tooltip><TooltipTrigger asChild>{ButtonContent}</TooltipTrigger><TooltipContent side="top" className="bg-zinc-800 dark:bg-zinc-900 border-zinc-700 dark:border-white/10 text-xs px-2 py-1 text-white shadow-xl rounded-lg" sideOffset={5}>{label}</TooltipContent></Tooltip>
            ) : ButtonContent}
            <PopoverContent className="p-0 w-[240px] bg-white/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl text-slate-800 dark:text-zinc-300 z-[60] rounded-xl overflow-hidden" align="start">{content}</PopoverContent>
        </Popover>
    );
};

// --- INTERNAL COMPONENT: RICH TEXT EDITOR ---
const RichTextEditor = ({ onSend }: { onSend: (html: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateFormats = () => {
        setFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline')
        });
    };

    const exec = (command: string, value: string | undefined = undefined) => { document.execCommand(command, false, value); editorRef.current?.focus(); updateFormats(); };
    const handleInput = () => { if (editorRef.current) setIsEmpty(editorRef.current.innerText.trim() === "" && editorRef.current.innerHTML === ""); updateFormats(); };
    const handleSend = () => { if (editorRef.current && !isEmpty) { onSend(editorRef.current.innerHTML); editorRef.current.innerHTML = ""; setIsEmpty(true); updateFormats(); } };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading(`Đang tải lên: ${file.name}...`);
        
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            
            editorRef.current?.focus(); 
            // Chèn một liên kết tải về thực tế với giao diện đẹp
            const linkHtml = `<br/><a href="${data.url}" target="_blank" download="${data.name}" class="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold rounded-lg border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all no-underline shadow-sm my-1 cursor-pointer" contenteditable="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                ${data.name}
            </a>&nbsp;`;
            
            document.execCommand('insertHTML', false, linkHtml); 
            toast.success("Tải lên thành công", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải file lên", { id: toastId });
        } finally {
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/50 dark:bg-black/20 overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all mt-4 shadow-sm">
            <div className="relative p-4 min-h-[100px]">
                {isEmpty && <div className="absolute top-4 left-4 text-zinc-400 dark:text-zinc-600 text-sm pointer-events-none select-none font-medium">Viết bình luận hoặc cập nhật...</div>}
                <div ref={editorRef} contentEditable onInput={handleInput} onMouseUp={updateFormats} onKeyUp={updateFormats} className="text-sm text-slate-700 dark:text-zinc-200 outline-none min-h-[60px] max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words prose prose-sm dark:prose-invert max-w-none font-medium" style={{ lineHeight: '1.6' }} />
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-white/5 border-t border-zinc-200/50 dark:border-white/5 select-none">
                <div className="flex items-center gap-0.5">
                    <Button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors", formats.bold && "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white")}><Bold className="h-4 w-4" /></Button>
                    <Button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors", formats.italic && "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white")}><Italic className="h-4 w-4" /></Button>
                    <Button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors", formats.underline && "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white")}><Underline className="h-4 w-4" /></Button>
                    <div className="w-[1px] h-4 bg-zinc-300 dark:bg-white/10 mx-1" />
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    <Button onMouseDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10"><ImageIcon className="h-4 w-4" /></Button>
                    <Button onMouseDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10"><Paperclip className="h-4 w-4" /></Button>
                </div>
                <Button disabled={isEmpty} onClick={handleSend} size="sm" className="h-8 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-5 shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:shadow-none">Gửi</Button>
            </div>
        </div>
    );
};

// --- MAIN EXPORT: WORK ITEM DETAIL PANEL ---
export function WorkItemsDetailPanel({
                                         task, tasks, members, onClose, onUpdate, onCreateSubtask
                                     }: {
    task: Task, tasks: Task[], members: any[], onClose: () => void, onUpdate: (id: string, field: string, val: any) => void, onCreateSubtask: () => void
}) {
    const subtasks = tasks.filter(t => t.parentId === task._id);
    const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);

    const activities = task.activities || [];

    const handleSendComment = (html: string) => {
        onUpdate(task._id, 'comment', html);
        toast.success("Đã gửi bình luận");
    };

    const renderDetailProp = (label: string, icon: any, valueDisplay: React.ReactNode, content: React.ReactNode) => (
        <div className="grid grid-cols-[140px_1fr] items-center py-2.5 group border-b border-zinc-100/50 dark:border-white/[0.02] last:border-0">
            <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</div>
            <div className="w-full">
                <AttributeButton icon={icon} label={label} valueDisplay={valueDisplay} content={content} showTooltip={false} className="bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-white/5 shadow-none h-8 px-2 w-auto min-w-[120px] max-w-full justify-start text-slate-700 dark:text-zinc-300 text-sm font-semibold hover:border-zinc-200 dark:hover:border-white/10 transition-all" />
            </div>
        </div>
    );

    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case 'create': return <FilePlus className="h-4 w-4 text-emerald-500" />;
            case 'assign': return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'state': return <RefreshCw className="h-4 w-4 text-cyan-500" />;
            case 'comment': return <MessageSquare className="h-4 w-4 text-indigo-500" />;
            default: return <Circle className="h-4 w-4 text-zinc-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 md:p-12">
            {/* Backdrop overlay */}
            <div className="absolute inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-[850px] h-full max-h-[90vh] bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl border border-zinc-200/60 dark:border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)] z-40 flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 ease-out rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-xl text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group">
                            <X className="h-5 w-5 transition-transform group-hover:scale-110" />
                        </Button>
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-white/5">
                            <span className="text-[11px] font-black tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">{task.taskId}</span>
                        </div>
                    </div>
                </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-8">
                {/* Title & Desc */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">Tiêu đề</label>
                        <div className="text-lg font-bold bg-zinc-50/50 dark:bg-black/20 border border-cyan-500/50 rounded-xl p-3 text-slate-900 dark:text-white min-h-[44px] break-words shadow-sm">
                            {task.title || <span className="text-zinc-400 italic font-normal">Chưa có tiêu đề</span>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1">Mô tả</label>
                        <div className="bg-zinc-50/50 dark:bg-black/20 border border-cyan-500/50 rounded-xl p-3 text-sm text-slate-700 dark:text-zinc-300 min-h-[80px] leading-relaxed font-medium break-words whitespace-pre-wrap shadow-sm">
                            {task.description || <span className="text-zinc-400 italic">Không có mô tả chi tiết...</span>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-4">
                    <Button onClick={onCreateSubtask} variant="outline" className="h-9 text-[13px] font-bold rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/30 shadow-sm transition-all gap-2">
                        <GitMerge className="h-4 w-4 text-cyan-500" /> Tạo công việc con
                    </Button>
                </div>

                {/* Properties */}
                <div className="space-y-2 px-4 bg-zinc-50/50 dark:bg-white/[0.02] p-5 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-inner">
                    {renderDetailProp("Trạng thái", LayoutGrid, <span className="font-bold text-slate-800 dark:text-white">{columns[task.status as keyof typeof columns]?.title}</span>, 
                        <Command className="bg-transparent border-0"><CommandList className="max-h-none p-1">{STATUS_OPTIONS.map(c => <CommandItem key={c.value} onSelect={() => onUpdate(task._id, 'status', c.value)} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer text-slate-700 dark:text-zinc-300 font-bold rounded-lg mb-0.5"><c.icon className={cn("mr-3 h-4 w-4", c.color)} />{c.label}</CommandItem>)}</CommandList></Command>
                    )}
                    
                    {renderDetailProp("Phụ trách", User, task.assignee ? task.assignee.name : "Thêm người phụ trách", 
                        <Command className="bg-transparent border-0"><CommandInput placeholder="Tìm thành viên..." className="h-10 text-sm font-medium border-b border-zinc-200 dark:border-white/10" /><CommandList className="max-h-[300px] p-1"><CommandEmpty className="text-zinc-500 text-sm py-4 text-center">Không tìm thấy</CommandEmpty><CommandGroup>
                        {members.map(m => (
                          <CommandItem key={m._id} onSelect={() => onUpdate(task._id, 'assignee', m)} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer text-slate-700 dark:text-zinc-300 font-bold rounded-lg mb-0.5 py-2">
                            <Avatar className="h-6 w-6 mr-3 border border-zinc-200 dark:border-white/10">
                                <AvatarImage src={m.avatar}/>
                                <AvatarFallback className="bg-cyan-500 text-white text-[10px] font-black uppercase">{m.name?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            {m.name}
                          </CommandItem>
                        ))}
                    </CommandGroup></CommandList></Command>
                    )}

                    <div className="grid grid-cols-[140px_1fr] items-center py-2.5 group border-b border-zinc-100/50 dark:border-white/[0.02] last:border-0">
                        <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Người tạo</div>
                        <div className="flex items-center gap-2.5 px-3">
                            <Avatar className="h-6 w-6 border border-zinc-200 dark:border-white/10">
                                <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-zinc-300 font-black uppercase">{task.creator?.name ? task.creator.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{task.creator?.name || 'Unknown'}</span>
                        </div>
                    </div>

                    {renderDetailProp("Bắt đầu", CalendarIcon, task.startDate ? format(new Date(task.startDate), "dd/MM/yyyy") : "Chọn ngày", 
                        <div className="w-auto p-0 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 z-[100] shadow-2xl rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-widest">Ngày bắt đầu</div>
                                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Click để chọn ngày dự kiến bắt đầu</div>
                            </div>
                            <Calendar mode="single" selected={task.startDate || undefined} onSelect={(d) => onUpdate(task._id, 'startDate', d)} className="p-3" />
                        </div>
                    )}
                    
                    {renderDetailProp("Kết thúc", CalendarIcon, task.endDate ? format(new Date(task.endDate), "dd/MM/yyyy") : "Chọn ngày", 
                        <div className="w-auto p-0 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 z-[100] shadow-2xl rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                                <div className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Ngày kết thúc</div>
                                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Phải lớn hơn hoặc bằng ngày bắt đầu</div>
                            </div>
                            <Calendar mode="single" selected={task.endDate || undefined} onSelect={(d) => onUpdate(task._id, 'endDate', d)} disabled={(date) => { const baseDate = task.startDate ? new Date(task.startDate) : new Date(); baseDate.setHours(0, 0, 0, 0); return date < baseDate; }} className="p-3" />
                        </div>
                    )}
                    
                    {renderDetailProp("Ước tính", Triangle, task.estimate ? `${task.estimate}h` : "Trống", 
                        <div className="p-2 grid grid-cols-4 gap-1.5 bg-white dark:bg-[#0f0f11] rounded-xl border border-zinc-200 dark:border-white/10">
                            {estimates.map(est => <div key={est} onClick={() => onUpdate(task._id, 'estimate', est)} className="px-3 py-2 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-200 dark:hover:border-cyan-500/30 text-sm font-bold text-slate-700 dark:text-zinc-300 rounded-lg cursor-pointer text-center border border-zinc-200 dark:border-white/5 transition-all bg-zinc-50 dark:bg-white/[0.02]">{est}h</div>)}
                        </div>
                    )}
                </div>

                {/* Subtasks */}
                {subtasks.length > 0 && (
                    <div className="space-y-3 px-4">
                        <div className="flex items-center gap-2 cursor-pointer select-none group" onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}>
                            <div className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                {isSubtasksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </div>
                            <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Công việc con</h3>
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-full">{subtasks.length}</span>
                        </div>
                        {isSubtasksExpanded && (
                            <div className="pl-6 animate-in slide-in-from-top-2 duration-300 ease-out">
                                <div className="space-y-2">
                                    {subtasks.map(sub => (
                                        <div key={sub._id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 hover:border-cyan-300 dark:hover:border-cyan-500/30 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                            <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", columns[sub.status as keyof typeof columns]?.color.replace('text-', 'bg-'))} />
                                            <span className="text-xs font-black tracking-widest text-zinc-400 group-hover:text-cyan-500 transition-colors uppercase">{sub.taskId}</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-zinc-200 flex-1 truncate">{sub.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Activity & Comment */}
                <div className="space-y-6 pt-4 pb-12 px-4">
                    <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Hoạt động & Bình luận</h3>
                    <div className="space-y-6 mt-6">
                        {activities.map((act: any) => (
                            <div key={act.id} className="flex gap-4 group">
                                <div className="flex-1 space-y-1.5 pt-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[13px] font-black text-slate-800 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer transition-colors">{act.user?.name}</span>
                                        {act.type === 'comment' ? (
                                            <span className="text-xs font-medium text-zinc-500">đã bình luận</span>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400" dangerouslySetInnerHTML={{ __html: act.content }}></span>
                                        )}
                                        <span className="text-[10px] text-zinc-300 dark:text-zinc-700 select-none">•</span>
                                        <span className="text-xs font-medium text-zinc-400" title={format(act.timestamp, "HH:mm dd/MM/yyyy")}>{formatDistanceToNow(act.timestamp, { addSuffix: true, locale: vi })}</span>
                                    </div>
                                    {act.type === 'comment' && (
                                        <div className={cn(
                                            "text-sm font-medium text-slate-700 dark:text-zinc-300 break-words prose prose-sm dark:prose-invert max-w-none mt-2 leading-relaxed bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 shadow-sm p-4 rounded-2xl rounded-tl-sm"
                                        )} dangerouslySetInnerHTML={{ __html: act.content }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <RichTextEditor onSend={handleSendComment} />
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
