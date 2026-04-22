'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from "date-fns";
import {
    X, Loader2, HelpCircle, Circle, Clock, CheckCircle2,
    MoreHorizontal, User, Triangle, Calendar as CalendarIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import {
    Task, STATUS_OPTIONS, IMPORTANCE_OPTIONS, estimates, STATUS_TRANSITIONS
} from './work-items-types';
import { normalizeDate, toDateOnly } from './work-items-utils';

interface WorkItemsCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projectName?: string;
    onSuccess: (task: Task, isEdit: boolean) => void;
    editTask: Task | null;
    parentTaskForSub: Task | null;
    initialStatus?: string;
}

export function WorkItemsCreateDialog({
                                          open,
                                          onOpenChange,
                                          projectId,
                                          projectName,
                                          onSuccess,
                                          editTask,
                                          parentTaskForSub,
                                          initialStatus = "Backlog"
                                      }: WorkItemsCreateDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: initialStatus,
        priority: "Medium" as 'Low' | 'Medium' | 'High',
        assignee: null as any | null,
        startDate: null as Date | null,
        endDate: null as Date | null,
        estimate: null as number | null
    });

    const [projectMembers, setProjectMembers] = useState<any[]>([]);
    
    // States for controlling popover open status
    const [statusOpen, setStatusOpen] = useState(false);
    const [assigneeOpen, setAssigneeOpen] = useState(false);
    const [estOpen, setEstOpen] = useState(false);
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const fetchMembers = async () => {
            try {
                const res = await axios.get(`/api/projects/${projectId}`);
                if (res.data && res.data.members) {
                    const mapped = res.data.members.map((m: any) => ({
                        _id: m._id,
                        name: `${m.lastname} ${m.firstname}`.trim() || m.email,
                        avatar: m.avatar
                    }));
                    setProjectMembers(mapped);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách thành viên:", error);
            }
        };
        fetchMembers();
    }, [projectId, open]);

    useEffect(() => {
        if (editTask) {
            setFormData({
                title: editTask.title,
                description: editTask.description || "",
                status: editTask.status,
                priority: editTask.priority || "Medium",
                assignee: editTask.assignee || null,
                startDate: editTask.startDate ? new Date(editTask.startDate) : null,
                endDate: editTask.endDate ? new Date(editTask.endDate) : null,
                estimate: editTask.estimate || null
            });
        } else {
            setFormData({
                title: "",
                description: "",
                status: initialStatus,
                priority: "Medium",
                assignee: null,
                startDate: null,
                endDate: null,
                estimate: null
            });
        }
    }, [editTask, initialStatus, open]);

    const isFormValid = !!(
        formData.title?.trim() && 
        formData.description?.trim() && 
        formData.assignee && 
        formData.estimate !== null && formData.estimate !== undefined &&
        formData.startDate && 
        formData.endDate
    );
    
    const handleSubmit = async () => {
        if (!formData.title?.trim()) return toast.error("Vui lòng nhập tiêu đề");
        if (!formData.description?.trim()) return toast.error("Vui lòng nhập mô tả chi tiết");
        if (!formData.assignee) return toast.error("Vui lòng chọn người gán");
        if (formData.estimate === null || formData.estimate === undefined) return toast.error("Vui lòng chọn thời gian ước tính");
        if (!formData.startDate) return toast.error("Vui lòng chọn ngày bắt đầu");
        if (!formData.endDate) return toast.error("Vui lòng chọn ngày kết thúc");

        if (formData.startDate && formData.endDate && toDateOnly(formData.endDate) < toDateOnly(formData.startDate)) {
            return toast.error("Ngày kết thúc không được trước ngày bắt đầu");
        }

        if (editTask && formData.status !== editTask.status) {
            const allowedNext = STATUS_TRANSITIONS[editTask.status] || [];
            if (!allowedNext.includes(formData.status)) {
                return toast.error("Không thể chuyển công việc sang trạng thái này");
            }
        }

        try {
            setIsSaving(true);
            const payload = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                assignee: formData.assignee?._id || null,
                startDate: normalizeDate(formData.startDate),
                dueDate: normalizeDate(formData.endDate),
                estimate: formData.estimate,
                parentId: parentTaskForSub?._id || undefined
            };

            const res = editTask 
                ? await axios.patch(`/api/projects/${projectId}/workitems`, { workItemId: editTask._id, ...payload })
                : await axios.post(`/api/projects/${projectId}/workitems`, payload);

            onSuccess(res.data, !!editTask);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error("Lưu công việc thất bại");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status) || STATUS_OPTIONS[0];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white sm:max-w-[750px] shadow-2xl p-0 gap-0 overflow-visible sm:rounded-xl outline-none [&>button]:hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.01] rounded-t-xl">
                    <div className="flex flex-col gap-1">
                        <DialogTitle className="text-lg font-bold tracking-tight">
                            {editTask ? "Chỉnh sửa công việc" : parentTaskForSub ? "Thêm công việc con" : "Thêm công việc mới"}
                        </DialogTitle>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="font-medium">{projectName || "Dự án"}</span>
                            {parentTaskForSub && (
                                <>
                                    <span>/</span>
                                    <span className="text-cyan-500 dark:text-cyan-400 font-bold">Thuộc: {parentTaskForSub.title}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full"><X className="h-5 w-5" /></Button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 min-h-[220px] space-y-6">
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-transparent border-none text-xl font-semibold px-0 placeholder:text-zinc-400 focus-visible:ring-0 shadow-none h-auto py-2"
                        placeholder={parentTaskForSub ? "Nhập tên công việc con..." : "Tiêu đề công việc..."}
                        autoFocus
                    />
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-transparent border-none text-sm text-zinc-700 dark:text-zinc-300 px-0 placeholder:text-zinc-400 focus-visible:ring-0 shadow-none resize-none min-h-[120px] leading-relaxed"
                        placeholder="Thêm mô tả chi tiết..."
                    />
                </div>

                {/* Actions Bar */}
                <div className="px-4 py-4 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-200 dark:border-white/5 flex items-center justify-between rounded-b-xl">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status */}
                        <Popover open={statusOpen} onOpenChange={setStatusOpen} modal={false}>
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
                                                const isActive = formData.status === opt.value;
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
                                                            setFormData({ ...formData, status: opt.value });
                                                            setStatusOpen(false);
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

                        {/* Assignee */}
                        <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen} modal={false}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <User className="h-3.5 w-3.5 text-zinc-500" />
                                    {formData.assignee ? formData.assignee.name : "Assignee"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[220px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                                <Command className="bg-transparent"><CommandInput placeholder="Tìm kiếm thành viên..." className="h-9 border-none focus:ring-0" /><CommandList><CommandGroup>
                                    {projectMembers.map(m => (
                                        <CommandItem key={m._id} onSelect={() => {
                                            setFormData({ ...formData, assignee: m });
                                            setAssigneeOpen(false);
                                        }} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer">
                                            <Avatar className="h-5 w-5 mr-3 border border-zinc-100 dark:border-white/5">
                                                <AvatarImage src={m.avatar} />
                                                <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase">{m.name?.charAt(0) || "?"}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium">{m.name}</span>
                                        </CommandItem>
                                    ))}
                                    {projectMembers.length === 0 && <CommandEmpty className="py-6 text-center text-zinc-500 text-xs text-muted-foreground italic">Chưa có thành viên trong dự án</CommandEmpty>}
                                </CommandGroup></CommandList></Command>
                            </PopoverContent>
                        </Popover>

                        {/* Estimate */}
                        <Popover open={estOpen} onOpenChange={setEstOpen} modal={false}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <Triangle className="h-3.5 w-3.5 text-zinc-500" />
                                    {(formData.estimate !== null && formData.estimate !== undefined) ? (formData.estimate === -1 ? "K.Giới hạn" : `${formData.estimate}h`) : "Est"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-2 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-[100] shadow-xl" align="start">
                                <div className="flex flex-wrap gap-1">{estimates.map(est => (
                                    <div key={est} onClick={() => {
                                        setFormData({ ...formData, estimate: est });
                                        setEstOpen(false);
                                    }} className="px-2 py-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 rounded cursor-pointer transition-colors whitespace-nowrap">
                                        {est === -1 ? <span className="text-xs font-bold">∞</span> : `${est}h`}
                                    </div>
                                ))}</div>
                            </PopoverContent>
                        </Popover>

                        {/* Start Date */}
                        <Popover open={startDateOpen} onOpenChange={setStartDateOpen} modal={false}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                                    {formData.startDate ? format(formData.startDate, "dd/MM") : "Bắt đầu"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 z-[100] shadow-2xl rounded-2xl overflow-hidden" align="start">

                                <Calendar 
                                    mode="single" 
                                    selected={formData.startDate || undefined} 
                                    onSelect={(d) => {
                                        setFormData({ ...formData, startDate: d || null });
                                        setStartDateOpen(false);
                                    }} 
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                    }}
                                    className="p-3"
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* End Date */}
                        <Popover open={endDateOpen} onOpenChange={setEndDateOpen} modal={false}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                                    {formData.endDate ? format(formData.endDate, "dd/MM") : "Kết thúc"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 z-[100] shadow-2xl rounded-2xl overflow-hidden" align="start">

                                <Calendar 
                                    mode="single" 
                                    selected={formData.endDate || undefined} 
                                    onSelect={(d) => {
                                        setFormData({ ...formData, endDate: d || null });
                                        setEndDateOpen(false);
                                    }} 
                                    disabled={(date) => {
                                        const baseDate = formData.startDate || new Date();
                                        baseDate.setHours(0, 0, 0, 0);
                                        return date < baseDate;
                                    }}
                                    className="p-3"
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white h-8 text-xs font-medium">Hủy bỏ</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isSaving || !isFormValid} 
                            className={cn(
                                "text-white font-bold h-8 px-4 rounded-lg shadow-md border-0 transition-all",
                                isFormValid 
                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 opacity-100" 
                                    : "bg-zinc-400/50 dark:bg-white/10 text-zinc-500 cursor-not-allowed shadow-none"
                            )}
                        >
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editTask ? "Lưu thay đổi" : "Lưu"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
