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
    Task, STATUS_OPTIONS, IMPORTANCE_OPTIONS, estimates, mockMembers, STATUS_TRANSITIONS
} from './work-items-types';
import { normalizeDate, toDateOnly } from './work-items-utils';

interface WorkItemsCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    onSuccess: (task: Task, isEdit: boolean) => void;
    editTask: Task | null;
    parentTaskForSub: Task | null;
    initialStatus?: string;
}

export function WorkItemsCreateDialog({
                                          open,
                                          onOpenChange,
                                          projectId,
                                          onSuccess,
                                          editTask,
                                          parentTaskForSub,
                                          initialStatus = "Todo"
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

    const handleSubmit = async () => {
        if (!formData.title) return toast.error("Vui lòng nhập tiêu đề");

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

            let res: any;
            if (editTask) {
                res = await axios.patch(`/api/projects/${projectId}/workitems`, {
                    workItemId: editTask._id,
                    ...payload
                });
                toast.success("Đã cập nhật công việc");
            } else {
                res = await axios.post(`/api/projects/${projectId}/workitems`, payload);
                toast.success("Đã tạo công việc mới");
            }

            const returnedTask = { ...res.data, endDate: res.data.dueDate };
            onSuccess(returnedTask, !!editTask);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error("Lưu công việc thất bại");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status) || STATUS_OPTIONS[1];
    const selectedPriority = IMPORTANCE_OPTIONS.find(i => i.value === formData.priority) || IMPORTANCE_OPTIONS[1];

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
                            <span className="font-medium">Tên dự án</span>
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
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <selectedStatus.icon className={cn("h-3.5 w-3.5", selectedStatus.color)} />
                                    {selectedStatus.label}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[200px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                                <Command className="bg-transparent"><CommandList><CommandGroup>{STATUS_OPTIONS.map((opt) => (
                                    <CommandItem key={opt.value} onSelect={() => setFormData({ ...formData, status: opt.value })} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer">{opt.label}</CommandItem>
                                ))}</CommandGroup></CommandList></Command>
                            </PopoverContent>
                        </Popover>

                        {/* Priority */}
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <selectedPriority.icon className={cn("h-3.5 w-3.5", selectedPriority.color)} />
                                    {selectedPriority.label}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[200px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                                <Command className="bg-transparent"><CommandList><CommandGroup>{IMPORTANCE_OPTIONS.map((opt) => (
                                    <CommandItem key={opt.value} onSelect={() => setFormData({ ...formData, priority: opt.value })} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer">{opt.label}</CommandItem>
                                ))}</CommandGroup></CommandList></Command>
                            </PopoverContent>
                        </Popover>

                        {/* Assignee */}
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <User className="h-3.5 w-3.5 text-zinc-500" />
                                    {formData.assignee ? formData.assignee.name : "Assignee"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[220px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                                <Command className="bg-transparent"><CommandInput placeholder="Search user..." className="h-9 border-none focus:ring-0" /><CommandList><CommandGroup>{mockMembers.map(m => (
                                    <CommandItem key={m.id} onSelect={() => setFormData({ ...formData, assignee: m })} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer"><Avatar className="h-4 w-4 mr-2"><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>{m.name}</CommandItem>
                                ))}</CommandGroup></CommandList></Command>
                            </PopoverContent>
                        </Popover>

                        {/* Estimate */}
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <Triangle className="h-3.5 w-3.5 text-zinc-500" />
                                    {formData.estimate ? `${formData.estimate}h` : "Est"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-2 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-[100] shadow-xl" align="start">
                                <div className="flex flex-wrap gap-1">{estimates.map(est => (
                                    <div key={est} onClick={() => setFormData({ ...formData, estimate: est })} className="px-2 py-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs text-zinc-700 dark:text-zinc-300 rounded cursor-pointer">{est}h</div>
                                ))}</div>
                            </PopoverContent>
                        </Popover>

                        {/* Dates */}
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                                    {formData.startDate ? format(formData.startDate, "dd/MM") : "Start"} - {formData.endDate ? format(formData.endDate, "dd/MM") : "End"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4 bg-[#1a1a1d] border-white/10 z-[100]" align="start">
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-wider">Ngày bắt đầu</div>
                                        <Calendar mode="single" selected={formData.startDate || undefined} onSelect={(d) => setFormData({ ...formData, startDate: d || null })} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-wider">Ngày kết thúc</div>
                                        <Calendar mode="single" selected={formData.endDate || undefined} onSelect={(d) => setFormData({ ...formData, endDate: d || null })} />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white h-8 text-xs font-medium">Hủy bỏ</Button>
                        <Button onClick={handleSubmit} disabled={isSaving} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold h-8 px-4 rounded-lg shadow-md border-0">
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editTask ? "Lưu thay đổi" : "Lưu"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
