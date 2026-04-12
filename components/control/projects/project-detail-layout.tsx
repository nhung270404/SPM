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
  FilePlus, RefreshCw, MessageSquare, UserPlus, Circle
} from 'lucide-react';

// UI
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Shared Data
import { Task, Activity, ActivityType, columns, estimates, mockMembers } from './project-data';
import { STATUS_OPTIONS } from './workitems/work-items-view';

// --- EXPORTED HELPER: ATTRIBUTE BUTTON (Để file cha dùng ké cho form Create) ---
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
          "h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all select-none border whitespace-nowrap",
          isActive ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-[#202024] hover:bg-[#2a2a2e] border-white/5 text-zinc-400 hover:text-zinc-200",
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
        <Tooltip><TooltipTrigger asChild>{ButtonContent}</TooltipTrigger><TooltipContent side="top" className="bg-zinc-900 border-white/10 text-xs px-2 py-1 text-zinc-300 shadow-none" sideOffset={5}>{label}</TooltipContent></Tooltip>
      ) : ButtonContent}
      <PopoverContent className="p-0 w-[240px] bg-[#1a1a1d] border-white/10 shadow-2xl text-zinc-300 z-[60]" align="start">{content}</PopoverContent>
    </Popover>
  );
};

// --- INTERNAL COMPONENT: RICH TEXT EDITOR ---
const RichTextEditor = ({ onSend }: { onSend: (html: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exec = (command: string, value: string | undefined = undefined) => { document.execCommand(command, false, value); editorRef.current?.focus(); };
  const handleInput = () => { if (editorRef.current) setIsEmpty(editorRef.current.innerText.trim() === "" && editorRef.current.innerHTML === ""); };
  const handleSend = () => { if (editorRef.current && !isEmpty) { onSend(editorRef.current.innerHTML); editorRef.current.innerHTML = ""; setIsEmpty(true); } };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { editorRef.current?.focus(); document.execCommand('insertHTML', false, `<br/><span class="text-indigo-400 underline cursor-pointer">[File: ${e.target.files[0].name}]</span>&nbsp;`); toast.success("Đã đính kèm file"); } };

  return (
    <div className="rounded-xl border border-white/10 bg-[#141416] overflow-hidden focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all mt-4">
      <div className="relative p-3 min-h-[80px]">
        {isEmpty && <div className="absolute top-3 left-3 text-zinc-600 text-sm pointer-events-none select-none">Thêm bình luận...</div>}
        <div ref={editorRef} contentEditable onInput={handleInput} className="text-sm text-zinc-200 outline-none min-h-[60px] max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words prose prose-invert prose-sm max-w-none" style={{ lineHeight: '1.5' }} />
      </div>
      <div className="flex items-center justify-between p-2 bg-[#1a1a1d] border-t border-white/5 select-none">
        <div className="flex items-center gap-0.5">
          <Button onClick={() => exec('bold')} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"><Bold className="h-3.5 w-3.5" /></Button>
          <Button onClick={() => exec('italic')} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"><Italic className="h-3.5 w-3.5" /></Button>
          <Button onClick={() => exec('underline')} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"><Underline className="h-3.5 w-3.5" /></Button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <Button onClick={() => exec('insertUnorderedList')} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"><List className="h-3.5 w-3.5" /></Button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"><ImageIcon className="h-3.5 w-3.5" /></Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"><Paperclip className="h-3.5 w-3.5" /></Button>
        </div>
        <Button disabled={isEmpty} onClick={handleSend} size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 gap-2">Gửi</Button>
      </div>
    </div>
  );
};

// --- MAIN EXPORT: TASK DETAIL PANEL ---
export function TaskDetailPanel({
  task, tasks, onClose, onUpdate, onCreateSubtask
}: {
  task: Task, tasks: Task[], onClose: () => void, onUpdate: (id: string, field: string, val: any) => void, onCreateSubtask: () => void
}) {
  const subtasks = tasks.filter(t => t.parentId === task._id);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);
  const headerFileRef = useRef<HTMLInputElement>(null);

  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', type: 'create', user: mockMembers[0], content: 'đã tạo công việc này', timestamp: new Date(Date.now() - 172800000) },
    { id: '2', type: 'assign', user: mockMembers[0], content: 'đã gán cho <b>Nguyễn Văn A</b>', timestamp: new Date(Date.now() - 86400000) },
    { id: '3', type: 'comment', user: mockMembers[1], content: 'Task này cần thêm thông tin API.', timestamp: new Date(Date.now() - 3600000) },
    { id: '4', type: 'state', user: mockMembers[0], content: 'đã chuyển trạng thái sang <b>In Progress</b>', timestamp: new Date(Date.now() - 120000) }
  ]);

  const handleSendComment = (html: string) => {
    const newActivity: Activity = { id: Math.random().toString(), type: 'comment', user: mockMembers[0], content: html, timestamp: new Date() };
    setActivities([...activities, newActivity]);
    toast.success("Đã gửi bình luận");
  };

  const handleHeaderAttach = () => { headerFileRef.current?.click(); };

  const renderDetailProp = (label: string, icon: any, valueDisplay: React.ReactNode, content: React.ReactNode) => (
    <div className="grid grid-cols-3 items-center py-2 group">
      <div className="text-zinc-500 text-sm font-medium col-span-1">{label}</div>
      <div className="col-span-2"><AttributeButton icon={icon} label={label} valueDisplay={valueDisplay} content={content} showTooltip={false} className="bg-transparent border-transparent hover:bg-white/5 h-8 px-2 w-full justify-start text-zinc-300 text-sm" /></div>
    </div>
  );

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'create': return <FilePlus className="h-3.5 w-3.5 text-zinc-400" />;
      case 'assign': return <UserPlus className="h-3.5 w-3.5 text-blue-400" />;
      case 'state': return <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />;
      case 'comment': return <MessageSquare className="h-3.5 w-3.5 text-cyan-500" />;
      default: return <Circle className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className="absolute inset-y-0 right-0 w-1/2 bg-[#0f0f11] border-l border-white/10 shadow-2xl z-[50] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 -ml-2"><ChevronLeft className="h-6 w-6 stroke-[2.5]" /></Button>
          <span className="text-sm font-mono text-zinc-500 mt-0.5">{task.taskId}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><MoreHorizontal className="h-5 w-5" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-8">
        {/* Title & Desc */}
        <div className="space-y-4">
          <Input value={task.title} onChange={(e) => onUpdate(task._id, 'title', e.target.value)} className="text-4xl font-bold bg-[#000000] border border-white/10 rounded-lg p-4 focus-visible:ring-1 focus-visible:ring-cyan-500 text-white placeholder:text-zinc-700 h-auto w-full transition-all shadow-md" placeholder="Tên task..." />
          <Textarea value={task.description || ""} onChange={(e) => onUpdate(task._id, 'description', e.target.value)} className="bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-zinc-400 placeholder:text-zinc-600 resize-none min-h-[60px] text-sm leading-relaxed" placeholder="Mô tả của task..." />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={onCreateSubtask} variant="outline" className="h-8 text-xs bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white gap-2"><GitMerge className="h-3.5 w-3.5" /> Tạo công việc con</Button>
          <input type="file" ref={headerFileRef} className="hidden" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Đã đính kèm: ${e.target.files[0].name}`); }} />
          <Button onClick={handleHeaderAttach} variant="outline" className="h-8 text-xs bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white gap-2"><Paperclip className="h-3.5 w-3.5" /> Đính kèm</Button>
        </div>

        {/* Subtasks */}
        {subtasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 cursor-pointer select-none group" onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}>
              <div className="p-1 rounded hover:bg-white/10 text-zinc-500 group-hover:text-white transition-colors">{isSubtasksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}</div>
              <h3 className="text-sm font-bold text-white">Mục công việc con</h3>
              <span className="text-xs text-zinc-600">({subtasks.length})</span>
            </div>
            {isSubtasksExpanded && (
              <div className="pl-6 animate-in slide-in-from-top-2 duration-200"><div className="space-y-1">{subtasks.map(sub => (<div key={sub._id} className="flex items-center gap-3 p-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"><div className={cn("h-2 w-2 rounded-full", columns[sub.status as keyof typeof columns]?.color.replace('text-', 'bg-'))} /><span className="text-xs font-mono text-zinc-500">{sub.taskId}</span><span className="text-sm text-zinc-300 flex-1 truncate">{sub.title}</span></div>))}</div></div>
            )}
          </div>
        )}

        {/* Properties */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white mb-2">Thuộc tính</h3>
          {renderDetailProp("Thuộc tính", LayoutGrid, <span className="capitalize">{columns[task.status as keyof typeof columns]?.title}</span>, <Command className="bg-transparent"><CommandList>{STATUS_OPTIONS.map(c => <CommandItem key={c.value} onSelect={() => onUpdate(task._id, 'status', c.value)} className="hover:bg-white/5 cursor-pointer"><c.icon className={cn("mr-2 h-3.5 w-3.5", c.color)} />{c.label}</CommandItem>)}</CommandList></Command>)}
          {renderDetailProp("Người phụ trách", User, task.assignee ? task.assignee.name : "Thêm người phụ trách", <Command className="bg-transparent"><CommandInput placeholder="Tìm..." className="h-8" /><CommandList><CommandEmpty>None</CommandEmpty><CommandGroup>{mockMembers.map(m => <CommandItem key={m.id} onSelect={() => onUpdate(task._id, 'assignee', m)} className="hover:bg-white/5 cursor-pointer"><Avatar className="h-4 w-4 mr-2"><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>{m.name}</CommandItem>)}</CommandGroup></CommandList></Command>)}
          <div className="grid grid-cols-3 items-center py-2"><div className="text-zinc-500 text-sm font-medium col-span-1">Người tạo</div><div className="col-span-2 flex items-center gap-2 px-2"><Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-zinc-700">{task.creator?.name[0]}</AvatarFallback></Avatar><span className="text-sm text-zinc-300">{task.creator?.name}</span></div></div>
          {renderDetailProp("Ngày bắt đầu", CalendarIcon, task.startDate ? format(new Date(task.startDate), "dd/MM/yyyy") : "Chọn ngày bắt đầu", <div className="p-3 bg-[#1a1a1d]"><Calendar mode="single" selected={task.startDate || undefined} onSelect={(d) => onUpdate(task._id, 'startDate', d)} className="bg-[#1a1a1d] text-zinc-300 rounded-md border border-white/10" /></div>)}
          {renderDetailProp("Ngày kết thúc", CalendarIcon, task.endDate ? format(new Date(task.endDate), "dd/MM/yyyy") : "Chọn ngày kết thúc", <div className="p-3 bg-[#1a1a1d]"><Calendar mode="single" selected={task.endDate || undefined} onSelect={(d) => onUpdate(task._id, 'endDate', d)} className="bg-[#1a1a1d] text-zinc-300 rounded-md border border-white/10" /></div>)}
          {renderDetailProp("Ước tính", Triangle, task.estimate || "Chọn thời gian ước tính", <div className="p-1">{estimates.map(est => <div key={est} onClick={() => onUpdate(task._id, 'estimate', est)} className="px-2 py-1 hover:bg-white/5 text-xs text-zinc-300 rounded cursor-pointer">{est}</div>)}</div>)}
        </div>

        {/* Activity & Comment */}
        <div className="space-y-6 pt-4 pb-10">
          <h3 className="text-sm font-bold text-white">Hoạt động</h3>
          <div className="relative pl-2 space-y-6 mt-6 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-8 flex gap-3 group">
                <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center"><div className="h-8 w-8 rounded-full bg-[#1a1a1d] border border-white/10 flex items-center justify-center z-10">{getActivityIcon(act.type)}</div></div>
                <div className="flex-1 space-y-1 pt-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white hover:underline cursor-pointer">{act.user.name}</span>
                    {act.type === 'comment' ? (<span className="text-xs text-zinc-500">đã bình luận</span>) : (<span className="text-xs text-zinc-400" dangerouslySetInnerHTML={{ __html: act.type === 'create' || act.type === 'assign' || act.type === 'state' ? act.content.replace(/<[^>]*>?/gm, '') : '' }}></span>)}
                    <span className="text-[10px] text-zinc-600 select-none">•</span>
                    <span className="text-xs text-zinc-500" title={format(act.timestamp, "HH:mm dd/MM/yyyy")}>{formatDistanceToNow(act.timestamp, { addSuffix: true, locale: vi })}</span>
                  </div>
                  {(act.type === 'comment' || act.content.includes('<b>')) && (<div className={cn("text-sm text-zinc-300 break-words prose prose-invert prose-sm max-w-none mt-1", act.type === 'comment' ? "bg-white/[0.03] border border-white/5 p-3 rounded-lg" : "")} dangerouslySetInnerHTML={{ __html: act.type === 'comment' ? act.content : act.content }} />)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6"><RichTextEditor onSend={handleSendComment} /></div>
        </div>
      </div>
    </div>
  );
}