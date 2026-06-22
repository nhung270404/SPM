'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from '@/context/user-context';

// Internal Components
import { WorkItemsBoard } from './work-items-board';
import { WorkItemsCreateDialog } from './work-items-create';
import { WorkItemsDetailPanel } from './work-items-detail';
import { Task, STATUS_TRANSITIONS } from './work-items-types';
import { normalizeDate, toDateOnly } from './work-items-utils';
export function WorkItemsView(props: { projectId: string }) {
  return (
      <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-[#020617]">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          }
      >
        <WorkItemsViewContent {...props} />
      </Suspense>
  );
}
 function WorkItemsViewContent({ projectId: _projectId }: { projectId: string }) {
  const { user: currentUser } = useUser();
  const [winReady, setWinReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trạng thái Modals và Panels
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [parentTaskForSub, setParentTaskForSub] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState("Backlog");

  // --- HỆ THỐNG PHÂN QUYỀN (ACCESS CONTROL) ---
  const isAdmin = currentUser?.roles?.some((r: any) => r.level <= 1) || false;
  const isProjectLeader = project && currentUser && (project.manager === currentUser._id || project.manager?._id === currentUser._id);
  const isMember = project?.members?.some((m: any) => 
    (typeof m === 'object' ? m._id === currentUser?._id : m === currentUser?._id)
  );
  
  const hasAccess = isAdmin || isProjectLeader || isMember;
  const canManageWork = isAdmin || isProjectLeader;

  useEffect(() => { setWinReady(true); }, []);

  const normalizeTask = (t: any) => ({
    ...t,
    startDate: t.startDate ? new Date(t.startDate) : null,
    endDate: t.dueDate ? new Date(t.dueDate) : (t.endDate ? new Date(t.endDate) : null),
    estimate: (t.estimate !== null && t.estimate !== undefined) ? Number(t.estimate) : null,
    assignee: t.assignee && typeof t.assignee === 'object' ? {
      ...t.assignee,
      name: `${t.assignee.lastname || ''} ${t.assignee.firstname || ''}`.trim() || t.assignee.email
    } : t.assignee,
    creator: t.creator && typeof t.creator === 'object' ? {
      ...t.creator,
      name: `${t.creator.lastname || ''} ${t.creator.firstname || ''}`.trim() || t.creator.email
    } : t.creator,
    activities: Array.isArray(t.activities) ? t.activities.map((a: any) => ({
      ...a,
      id: a._id || a.id || Math.random().toString(),
      timestamp: new Date(a.timestamp),
      user: a.user && typeof a.user === 'object' ? {
        ...a.user,
        name: `${a.user.lastname || ''} ${a.user.firstname || ''}`.trim() || a.user.email
      } : a.user
    })) : []
  });

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
      const mappedTasks = res.data.map((t: any) => normalizeTask(t));
      setTasks(mappedTasks);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Không tải được công việc");
    } finally {
      setIsLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get('taskId');

  useEffect(() => {
    if (_projectId) {
      fetchProject();
      fetchTasks();
    }
  }, [_projectId]);

  useEffect(() => {
    if (taskIdParam && tasks.length > 0) {
      const task = tasks.find(t => t._id === taskIdParam);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [taskIdParam, tasks]);

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const fromStatus = source.droppableId;
    const toStatus = destination.droppableId;
    if (fromStatus === toStatus) return;

    const taskToMove = tasks.find(t => t._id === draggableId);
    if (!taskToMove) return;

    const isAssignee = taskToMove.assignee && (
      (typeof taskToMove.assignee === 'object' && taskToMove.assignee._id === currentUser?._id) ||
      (taskToMove.assignee === currentUser?._id)
    );

    if (!canManageWork && !isAssignee) {
        return toast.error("Bạn không có quyền thay đổi trạng thái công việc này");
    }

    const allowedNext = STATUS_TRANSITIONS[fromStatus] || [];
    if (!allowedNext.includes(toStatus)) {
      return toast.error("Không thể kéo công việc sang trạng thái này");
    }

    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: toStatus } : t));

    try {
      const res = await axios.patch(`/api/projects/${_projectId}/workitems`, {
        workItemId: draggableId,
        status: toStatus
      });
      if (res.data) {
        const updated = normalizeTask(res.data);
        setTasks(prev => prev.map(t => t._id === draggableId ? updated : t));
        setSelectedTask(prev => prev?._id === draggableId ? updated : prev);
      }
    } catch (err) {
      toast.error("Không lưu được trạng thái");
      fetchTasks();
    }
  };

  const handleUpdateTask = async (taskId: string, field: string, value: any) => {
    const currentTask = tasks.find(t => t._id === taskId);
    if (!currentTask) return;

    const isAssignee = currentTask.assignee && (
      (typeof currentTask.assignee === 'object' && currentTask.assignee._id === currentUser?._id) ||
      (currentTask.assignee === currentUser?._id)
    );

    if (field === 'status') {
      if (!canManageWork && !isAssignee) {
        return toast.error("Bạn không có quyền thay đổi trạng thái công việc này");
      }
    } else {
      if (!canManageWork) {
        return toast.error("Chỉ Leader mới có quyền chỉnh sửa thông tin này");
      }
    }

    if (field === 'startDate' && currentTask.endDate && toDateOnly(value) > toDateOnly(new Date(currentTask.endDate))) {
      return toast.error("Ngày bắt đầu không được sau ngày kết thúc");
    }
    if (field === 'endDate' && currentTask.startDate && toDateOnly(value) < toDateOnly(new Date(currentTask.startDate))) {
      return toast.error("Ngày kết thúc không được trước ngày bắt đầu");
    }

    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, [field]: value } : t));
    if (selectedTask?._id === taskId) setSelectedTask(prev => prev ? { ...prev, [field]: value } : null);

    const payload: any = { workItemId: taskId };
    if (field === 'assignee') payload[field] = value?._id || null;
    else if (field === 'startDate' || field === 'endDate') payload[field === 'endDate' ? 'dueDate' : field] = normalizeDate(value);
    else payload[field] = value;

    try {
      const res = await axios.patch(`/api/projects/${_projectId}/workitems`, payload);
      if (res.data) {
        const updated = normalizeTask(res.data);
        setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
        setSelectedTask(prev => prev?._id === taskId ? updated : prev);
      }
    } catch (err) {
      toast.error("Không lưu được thay đổi");
      fetchTasks();
    }
  };

  const handleCreateSuccess = (taskRaw: any, isEdit: boolean) => {
    const task = normalizeTask(taskRaw);
    if (isEdit) {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    } else {
      setTasks(prev => [task, ...prev]);
    }
    toast.success(isEdit ? "Đã cập nhật công việc" : "Đã tạo công việc mới");
  };

  const openCreateDialog = (status = "Backlog", parent: Task | null = null) => {
    if (!canManageWork) return toast.error("Chỉ Leader mới có quyền tạo công việc");
    setEditTask(null);
    setParentTaskForSub(parent);
    setInitialStatus(status);
    setIsCreateOpen(true);
  };

  const openEditDialog = (task: Task) => {
    if (!canManageWork) return toast.error("Chỉ Leader mới có quyền chỉnh sửa công việc");
    setEditTask(task);
    setParentTaskForSub(null);
    setIsCreateOpen(true);
  };

  if (!winReady || isLoading) return <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-[#020617]"><Loader2 className="h-6 w-6 animate-spin text-cyan-500" /></div>;

  // KIỂM TRA QUYỀN TRUY CẬP DỰ ÁN
  if (project && !hasAccess) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-zinc-50 dark:bg-[#020617] p-8 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mb-2">Truy cập bị từ chối</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
          Bạn không có quyền truy cập vào dự án này. Vui lòng liên hệ Admin hoặc Leader dự án để được cấp quyền.
        </p>
        <Button asChild className="rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 transition-all px-8 h-12 font-bold">
          <Link href="/control/projects">Quay lại danh sách dự án</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full w-full relative bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500">
        
        {/* HEADER */}
        <div className="flex-none h-16 border-b border-zinc-200/60 dark:border-white/5 flex items-center justify-between px-8 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl z-20 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-5">
            <Button asChild className="h-10 w-10 p-0 rounded-2xl bg-cyan-100/50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-200/50 dark:border-cyan-500/20 shadow-none transition-all">
              <Link href="/control/projects">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-800 dark:text-slate-100 truncate max-w-[400px]">
                    {project?.title || "Dự án"}
                  </h1>
                  <span className="text-[11px] text-cyan-500 font-black bg-cyan-500/5 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                    {project?.key || "..."}
                  </span>
               </div>
            </div>
          </div>

          {canManageWork && (
            <Button size="sm" onClick={() => openCreateDialog()} className="bg-cyan-100/50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-200/50 dark:border-cyan-500/20 text-[11px] font-black uppercase h-10 px-6 rounded-2xl transition-all">
                + Công việc mới
            </Button>
          )}
        </div>

        {/* BOARD CONTENT */}
        <div className="flex-1 relative min-h-0 z-10">
          <WorkItemsBoard 
            tasks={tasks}
            members={project?.members?.map((m: any) => ({
              ...m,
              name: `${m.lastname} ${m.firstname}`.trim() || m.email
            })) || []}
            onDragEnd={handleDragEnd}
            onSelectTask={setSelectedTask}
            onEditTask={openEditDialog}
            onUpdateTask={handleUpdateTask}
            onOpenCreateDialog={openCreateDialog}
            canManageWork={canManageWork}
          />
        </div>

        <WorkItemsCreateDialog 
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          projectId={_projectId}
          projectName={project?.title}
          onSuccess={handleCreateSuccess}
          editTask={editTask}
          parentTaskForSub={parentTaskForSub}
          initialStatus={initialStatus}
        />

        {selectedTask && (
          <WorkItemsDetailPanel 
            task={selectedTask}
            tasks={tasks}
            members={project?.members?.map((m: any) => ({
              ...m,
              name: `${m.lastname} ${m.firstname}`.trim() || m.email
            })) || []}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onCreateSubtask={() => {
              if (canManageWork) {
                setParentTaskForSub(selectedTask);
                setIsCreateOpen(true);
              } else {
                toast.error("Chỉ Leader mới có quyền tạo công việc phụ");
              }
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}