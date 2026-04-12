'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TooltipProvider } from "@/components/ui/tooltip";

// Internal Components (Đã được chia nhỏ)
import { WorkItemsBoard } from './work-items-board';
import { WorkItemsCreateDialog } from './work-items-create';
import { WorkItemsDetailPanel } from './work-items-detail';
import { Task, STATUS_TRANSITIONS } from './work-items-types';
import { normalizeDate, toDateOnly } from './work-items-utils';

export function WorkItemsView({ projectId: _projectId }: { projectId: string }) {
  const [winReady, setWinReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trạng thái Modals và Panels
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [parentTaskForSub, setParentTaskForSub] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState("Todo");

  useEffect(() => { setWinReady(true); }, []);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${_projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông tin dự án:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/projects/${_projectId}/workitems`);
      const mappedTasks = res.data.map((t: any) => ({
        ...t,
        startDate: t.startDate ? new Date(t.startDate) : null,
        endDate: t.dueDate ? new Date(t.dueDate) : null
      }));
      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được công việc");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (_projectId) {
      fetchProject();
      fetchTasks();
    }
  }, [_projectId]);

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const fromStatus = source.droppableId;
    const toStatus = destination.droppableId;
    if (fromStatus === toStatus) return;

    // Kiểm tra quy định chuyển trạng thái
    const allowedNext = STATUS_TRANSITIONS[fromStatus] || [];
    if (!allowedNext.includes(toStatus)) {
      return toast.error("Không thể kéo công việc sang trạng thái này");
    }

    // Cập nhật giao diện nhanh (Optimistic Update)
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: toStatus } : t));

    try {
      await axios.patch(`/api/projects/${_projectId}/workitems`, {
        workItemId: draggableId,
        status: toStatus
      });
    } catch (err) {
      toast.error("Không lưu được trạng thái");
      fetchTasks(); // Tải lại dữ liệu nếu có lỗi
    }
  };

  const handleUpdateTask = async (taskId: string, field: string, value: any) => {
    const currentTask = tasks.find(t => t._id === taskId);
    if (!currentTask) return;

    // Kiểm tra logic ngày tháng
    if (field === 'startDate' && currentTask.endDate && toDateOnly(value) > toDateOnly(new Date(currentTask.endDate))) {
      return toast.error("Ngày bắt đầu không được sau ngày kết thúc");
    }
    if (field === 'endDate' && currentTask.startDate && toDateOnly(value) < toDateOnly(new Date(currentTask.startDate))) {
      return toast.error("Ngày kết thúc không được trước ngày bắt đầu");
    }

    // Cập nhật State cục bộ
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, [field]: value } : t));
    if (selectedTask?._id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, [field]: value } : null);
    }

    // Chuẩn bị dữ liệu gửi đi
    const payload: any = { workItemId: taskId };
    if (field === 'assignee') payload[field] = value?._id || null;
    else if (field === 'startDate' || field === 'endDate') payload[field === 'endDate' ? 'dueDate' : field] = normalizeDate(value);
    else payload[field] = value;

    try {
      await axios.patch(`/api/projects/${_projectId}/workitems`, payload);
    } catch (err) {
      console.error(err);
      toast.error("Không lưu được thay đổi");
      fetchTasks();
    }
  };

  const handleCreateSuccess = (task: Task, isEdit: boolean) => {
    fetchTasks(); // Làm mới toàn bộ danh sách để đảm bảo đồng bộ
    toast.success(isEdit ? "Đã cập nhật công việc" : "Đã tạo công việc mới");
  };

  const openCreateDialog = (status = "Todo", parent: Task | null = null) => {
    setEditTask(null);
    setParentTaskForSub(parent);
    setInitialStatus(status);
    setIsCreateOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditTask(task);
    setParentTaskForSub(null);
    setIsCreateOpen(true);
  };

  if (!winReady || isLoading) return <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-[#020617]"><Loader2 className="h-6 w-6 animate-spin text-cyan-500" /></div>;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full w-full overflow-hidden relative bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500">
        
        {/* MESH GRADIENT BACKGROUND ELEMENTS */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

        {/* HEADER */}
        <div className="flex-none h-16 border-b border-zinc-200/60 dark:border-white/5 flex items-center justify-between px-8 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl z-20 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-5">
            <Button asChild className="h-10 w-10 p-0 rounded-2xl bg-cyan-100/50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-200/50 dark:border-cyan-500/20 shadow-none transition-all hover:scale-110 active:scale-95 group">
              <Link href="/control/projects">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </Button>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1"></div>

            <div className="flex flex-col gap-0">
               <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100 truncate max-w-[400px]">
                    {project?.title || (isLoading ? "Đang tải dự án..." : "Dự án")}
                  </h1>
                  <div className="h-3 w-[1px] bg-slate-300 dark:bg-white/20 mx-1"></div>
                  <span className="text-[11px] text-cyan-500 font-black tracking-tighter bg-cyan-500/5 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                    {project?.key || "..."}
                  </span>
               </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1"></div>
            
            <div className="flex items-center gap-1.5 bg-zinc-100/50 dark:bg-white/5 px-3 py-1.5 rounded-2xl border border-zinc-200/50 dark:border-white/10">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">Issues</span>
              <span className="text-[11px] text-cyan-500 font-mono font-black">{tasks.length}</span>
            </div>
          </div>
          <Button size="sm" onClick={() => openCreateDialog()} className="bg-cyan-100/50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-200/50 dark:border-cyan-500/20 text-[11px] font-black uppercase tracking-wider h-10 px-6 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 shadow-none">
            + Công việc mới
          </Button>
        </div>

        {/* BOARD CONTENT */}
        <div className="flex-1 relative min-h-0 z-10">
          <WorkItemsBoard 
            tasks={tasks}
            onDragEnd={handleDragEnd}
            onSelectTask={setSelectedTask}
            onEditTask={openEditDialog}
            onUpdateTask={handleUpdateTask}
            onOpenCreateDialog={openCreateDialog}
          />
        </div>

        {/* MODALS & PANELS */}
        <WorkItemsCreateDialog 
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          projectId={_projectId}
          onSuccess={handleCreateSuccess}
          editTask={editTask}
          parentTaskForSub={parentTaskForSub}
          initialStatus={initialStatus}
        />

        {selectedTask && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <WorkItemsDetailPanel 
                task={selectedTask}
                tasks={tasks}
                onClose={() => setSelectedTask(null)}
                onUpdate={handleUpdateTask}
                onCreateSubtask={() => openCreateDialog('Todo', selectedTask)}
              />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}