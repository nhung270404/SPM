'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format } from "date-fns";
import { toast } from 'sonner';
import Link from 'next/link';

// Icons
import {
  Plus, User, Calendar as CalendarIcon, Triangle, ArrowLeft, GitMerge, Loader2, X,
  CheckCircle2, Clock, HelpCircle, MoreHorizontal, ArrowUpCircle, Circle
} from 'lucide-react';

// UI
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Import Shared Logic
import { TaskDetailPanel } from '../project-detail-layout';
import axios from 'axios';

// --- TYPES ---
export type Task = {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Cancel';
  priority: 'Low' | 'Medium' | 'High';
  assignee: any | null;
  startDate: Date | null;
  endDate: Date | null;
  estimate: any | null;
  parentId?: string | null;
  creator: any;
};

const estimates = [1, 2, 3, 5, 8, 13, 21, 34];
const mockMembers = [
  { id: '1', _id: '1', name: 'Nguyễn Văn A', avatar: '' },
  { id: '2', _id: '2', name: 'Trần Thị B', avatar: '' },
  { id: '3', _id: '3', name: 'Lê Văn C', avatar: '' },
];

const columns = {
  'Backlog': { id: 'Backlog', title: 'Backlog', icon: HelpCircle, color: 'text-slate-500' },
  'Todo': { id: 'Todo', title: 'To Do', icon: Circle, color: 'text-slate-500' },
  'In Progress': { id: 'In Progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  'Done': { id: 'Done', title: 'Done', icon: CheckCircle2, color: 'text-green-600' },
  'Cancel': { id: 'Cancel', title: 'Canceled', icon: X, color: 'text-red-500' },
};

export const STATUS_OPTIONS = [
  { value: 'Backlog', label: 'Backlog', icon: HelpCircle, color: 'text-slate-500' },
  { value: 'Todo', label: 'To Do', icon: Circle, color: 'text-slate-500' },
  { value: 'In Progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { value: 'Done', label: 'Done', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'Cancel', label: 'Canceled', icon: X, color: 'text-red-500' },
];

const IMPORTANCE_OPTIONS: {
  value: 'Low' | 'Medium' | 'High';
  label: string;
  icon: any;
  color: string;
}[] = [
    { value: 'High', label: 'High', icon: ArrowUpCircle, color: 'text-cyan-500' },
    { value: 'Medium', label: 'Medium', icon: MoreHorizontal, color: 'text-blue-500' },
    { value: 'Low', label: 'Low', icon: ArrowUpCircle, color: 'text-slate-500 rotate-180' },
  ];

// RULE KÉO GIỮA CÁC CỘT
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Backlog': ['Todo', 'Cancel'],
  'Todo': ['Cancel', 'In Progress', 'Done'],
  'In Progress': ['Done', 'Todo', 'Cancel'],
  'Done': ['Todo'],
  'Cancel': ['Todo'],
};

export function WorkItemsView({ projectId: _projectId }: { projectId: string }) {
  const [winReady, setWinReady] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [parentTaskForSub, setParentTaskForSub] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  // Form State
  const [newTaskData, setNewTaskData] = useState<{
    title: string; description: string; status: string; priority: 'Low' | 'Medium' | 'High';
    assignee: any | null; startDate: Date | null; endDate: Date | null; estimate: number | null;
  }>({
    title: "", description: "", status: "Todo", priority: "Medium",
    assignee: null, startDate: null, endDate: null, estimate: null
  });

  useEffect(() => { setWinReady(true); }, []);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `/api/projects/${_projectId}/workitems`
        );
        const mappedTasks = res.data.map((t: any) => {
          // Chuẩn hóa status sang dạng viết hoa chữ cái đầu nếu cần
          const s = t.status;
          const normalizedStatus = (s === 'todo' || s === 'Todo') ? 'Todo' :
            (s === 'backlog' || s === 'Backlog') ? 'Backlog' :
              (s === 'in_progress' || s === 'in progress' || s === 'In Progress') ? 'In Progress' :
                (s === 'done' || s === 'Done') ? 'Done' :
                  (s === 'canceled' || s === 'cancel' || s === 'Cancel') ? 'Cancel' : 'Todo';

          return {
            ...t,
            status: normalizedStatus,
            startDate: t.startDate ? new Date(t.startDate) : null,
            endDate: t.dueDate ? new Date(t.dueDate) : null
          };
        });
        setTasks(mappedTasks);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được công việc");
      }
    };

    fetchTasks();
  }, [_projectId]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromStatus = source.droppableId;
    const toStatus = destination.droppableId;

    if (fromStatus === toStatus) return;

    // CHECK RULE KÉO
    const allowedNext = STATUS_TRANSITIONS[fromStatus] || [];
    if (!allowedNext.includes(toStatus)) {
      toast.error("Không thể kéo công việc sang trạng thái này");
      return;
    }

    // Optimistic UI
    setTasks(prev =>
      prev.map(t =>
        t._id === draggableId
          ? { ...t, status: toStatus as Task['status'] }
          : t
      )
    );

    // Lưu DB
    try {
      await axios.patch(
        `/api/projects/${_projectId}/workitems`,
        {
          workItemId: draggableId,
          status: toStatus
        }
      );
    } catch (err) {
      toast.error("Không lưu được trạng thái");
      console.error(err);
    }
  };

  const updateTask = async (taskId: string, field: string, value: any) => {
    const currentTask = tasks.find(t => t._id === taskId);
    if (!currentTask) return;

    if (field === 'startDate' && currentTask.endDate) {
      if (toDateOnly(value) > toDateOnly(new Date(currentTask.endDate))) {
        toast.error("Ngày bắt đầu không được sau ngày kết thúc");
        return;
      }
    }

    if (field === 'endDate' && currentTask.startDate) {
      if (toDateOnly(value) < toDateOnly(new Date(currentTask.startDate))) {
        toast.error("Ngày kết thúc không được trước ngày bắt đầu");
        return;
      }
    }

    if (field === 'status') {
      const allowedNext = STATUS_TRANSITIONS[currentTask.status] || [];
      if (!allowedNext.includes(value) && value !== currentTask.status) {
        toast.error("Không thể chuyển công việc sang trạng thái này");
        return;
      }
    }

    setTasks(prev =>
      prev.map(t =>
        t._id === taskId ? { ...t, [field]: value } as Task : t
      )
    );

    if (selectedTask?._id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, [field]: value } : null);
    }

    const payload: any = {
      workItemId: taskId,
      [field === 'endDate' ? 'dueDate' : field]: value
    };

    if (field === 'assignee') {
      payload[field] = value?._id || null;
    }

    if (field === 'startDate' || field === 'endDate') {
      payload[field === 'endDate' ? 'dueDate' : field] = normalizeDate(value);
    }

    try {
      await axios.patch(
        `/api/projects/${_projectId}/workitems`,
        payload
      );
    } catch (err) {
      console.error(err);
      toast.error("Không lưu được thay đổi");
    }
  };

  const normalizeDate = (d: Date | null) => {
    if (!d) return null;
    const date = new Date(d);
    date.setHours(12, 0, 0, 0);
    return date;
  };
  const toDateOnly = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const handleSubmitTask = async () => {
    if (!newTaskData.title) {
      return toast.error("Vui lòng nhập tiêu đề");
    }

    if (
      newTaskData.startDate &&
      newTaskData.endDate &&
      toDateOnly(newTaskData.endDate) < toDateOnly(newTaskData.startDate)
    ) {
      return toast.error("Ngày kết thúc không được trước ngày bắt đầu");
    }

    if (editTask && newTaskData.status !== editTask.status) {
      const allowedNext = STATUS_TRANSITIONS[editTask.status] || [];
      if (!allowedNext.includes(newTaskData.status)) {
        return toast.error("Không thể chuyển công việc sang trạng thái này");
      }
    }

    try {
      setIsSaving(true);

      const payload = {
        title: newTaskData.title,
        description: newTaskData.description,
        status: newTaskData.status,
        priority: newTaskData.priority,
        assignee: newTaskData.assignee?._id || null,
        startDate: normalizeDate(newTaskData.startDate),
        dueDate: normalizeDate(newTaskData.endDate),
        estimate: newTaskData.estimate,
      };

      let res: any;

      if (editTask) {
        res = await axios.patch(
          `/api/projects/${_projectId}/workitems`,
          {
            workItemId: editTask._id,
            ...payload
          }
        );

        setTasks(prev =>
          prev.map(t => t._id === res.data._id ? { ...res.data, endDate: res.data.dueDate } : t)
        );

        const mappedRes = { ...res.data, endDate: res.data.dueDate };
        if (selectedTask?._id === mappedRes._id) {
          setSelectedTask(mappedRes);
        }

        toast.success("Đã cập nhật công việc");
      } else {
        res = await axios.post(
          `/api/projects/${_projectId}/workitems`,
          payload
        );

        // Chuẩn hóa status từ response
        const s = res.data.status;
        const normalizedStatus = (s === 'todo' || s === 'Todo') ? 'Todo' :
          (s === 'backlog' || s === 'Backlog') ? 'Backlog' :
            (s === 'in_progress' || s === 'in progress' || s === 'In Progress') ? 'In Progress' :
              (s === 'done' || s === 'Done') ? 'Done' :
                (s === 'canceled' || s === 'cancel' || s === 'Cancel') ? 'Cancel' : 'Todo';

        const mappedNewTask = { ...res.data, status: normalizedStatus, endDate: res.data.dueDate };
        setTasks(prev => [mappedNewTask, ...prev]);
        toast.success("Đã tạo công việc mới");
      }

      setIsCreateOpen(false);
      setEditTask(null);

      setNewTaskData({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        assignee: null,
        startDate: null,
        endDate: null,
        estimate: null
      });

    } catch (err) {
      console.error(err);
      toast.error("Lưu công việc thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateDialog = (status = "Todo", parent: Task | null = null) => {
    setEditTask(null);
    setParentTaskForSub(parent);
    setNewTaskData({
      title: "", description: "", status, priority: "Medium",
      assignee: null, startDate: null, endDate: null, estimate: null
    });
    setIsCreateOpen(true);
  };

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);
  const getParentInfo = (parentId: string) => { const parent = tasks.find(t => t._id === parentId); return parent ? `${parent.taskId} - ${parent.title}` : "Unknown Parent"; };

  const createStatus = STATUS_OPTIONS.find(s => s.value === newTaskData.status) || STATUS_OPTIONS[1];
  const createImportance = IMPORTANCE_OPTIONS.find(i => i.value === newTaskData.priority) || IMPORTANCE_OPTIONS[1];

  const stopProp = (e: React.MouseEvent | React.PointerEvent) => { e.stopPropagation(); };

  if (!winReady) return <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-[#020617]"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full w-full overflow-hidden relative bg-slate-50 dark:bg-[#020617] font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-white">

        {/* HEADER */}
        <div className="flex-none h-14 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#020617] z-20 sticky top-0 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 -ml-2"><Link href="/control/projects"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10"></div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><span className="text-cyan-500">❖</span> Board</h1>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-white/10"></div>
            <span className="text-xs text-zinc-500 font-mono">{tasks.length} issues</span>
          </div>
          <Button size="sm" onClick={() => openCreateDialog('Todo')} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-xs font-bold h-8 px-4 rounded-xl shadow-md border-0 transition-all hover:scale-105 active:scale-95"> Thêm công việc mới</Button>
        </div>

        {/* BOARD CONTENT */}
        <div className="flex-1 relative min-h-0 z-10">
          <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex h-full p-6 gap-5 w-max">
                {Object.values(columns).map((col) => (
                  <div key={col.id} className="flex-none w-[320px] flex flex-col h-full relative">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2"><col.icon className={cn("h-3.5 w-3.5", col.color)} /><span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{col.title}</span><span className="text-[10px] text-zinc-400 dark:text-zinc-600 ml-1">{getTasksByStatus(col.id).length}</span></div>
                      <Button variant="ghost" size="icon" onClick={() => openCreateDialog(col.id)} className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className={cn("flex-1 rounded-xl bg-zinc-100 dark:bg-[#0a0a0c] border border-zinc-200 dark:border-white/5 p-2 overflow-y-auto custom-scrollbar transition-colors", snapshot.isDraggingOver ? "bg-zinc-200 dark:bg-white/[0.02]" : "")}>
                          {getTasksByStatus(col.id).map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTask(task)}
                                  style={{ ...provided.draggableProps.style }}
                                  className={cn(
                                    "group relative flex flex-col gap-3 p-3 mb-2 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm",
                                    "bg-white border-slate-200 hover:border-cyan-300 hover:shadow-md",
                                    "dark:bg-[#141416] dark:border-white/5 dark:hover:border-white/10 dark:hover:bg-[#1a1a1d]",
                                    snapshot.isDragging ? "shadow-2xl ring-2 ring-cyan-500/50 z-50 rotate-1 opacity-90" : ""
                                  )}
                                >
                                  {/* Top */}
                                  <div className="flex flex-col gap-1">
                                    {task.parentId && (<div className="flex items-center gap-1 text-[9px] text-zinc-400"><GitMerge className="h-2.5 w-2.5 rotate-180" /><span className="truncate max-w-[200px]">{getParentInfo(task.parentId)}</span></div>)}
                                    <div className="flex justify-between items-start">
                                      <span className="text-[10px] text-zinc-400 font-mono group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                        {task.taskId}
                                      </span>

                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-100 dark:hover:bg-white/10"
                                          >
                                            <MoreHorizontal className="h-4 w-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-white" />
                                          </button>
                                        </PopoverTrigger>

                                        <PopoverContent
                                          className="w-32 p-1 text-xs"
                                          align="end"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            className="w-full text-left px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-white/10"
                                            onClick={() => {
                                              setParentTaskForSub(null);
                                              setEditTask(task);
                                              setNewTaskData({
                                                title: task.title,
                                                description: task.description || "",
                                                status: task.status,
                                                priority: task.priority || "Medium",
                                                assignee: task.assignee || null,
                                                startDate: task.startDate ? new Date(task.startDate) : null,
                                                endDate: task.endDate ? new Date(task.endDate) : null,
                                                estimate: task.estimate || null
                                              });
                                              setIsCreateOpen(true);
                                            }}

                                          >
                                            ✏️ Edit
                                          </button>
                                        </PopoverContent>
                                      </Popover>

                                    </div>
                                  </div>
                                  <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug group-hover:text-black dark:group-hover:text-white">{task.title}</div>

                                  {/* --- INTERACTIVE ATTRIBUTES ON CARD --- */}
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1"
                                    onClick={stopProp}>
                                    {/* Status Button */}
                                    {(() => {
                                      const sInfo = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[1];
                                      return (
                                        <Popover modal={true}>
                                          <PopoverTrigger asChild>
                                            <button className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/5 transition-colors">
                                              <sInfo.icon className={cn("h-3 w-3", sInfo.color)} />
                                              <span>{sInfo.label}</span>
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="p-0 w-[180px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-50 shadow-xl" align="start">
                                            <Command className="bg-transparent"><CommandList><CommandGroup>{STATUS_OPTIONS.map(opt => (
                                              <CommandItem key={opt.value} onSelect={() => updateTask(task._id, 'status', opt.value)} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer text-xs"><opt.icon className={cn("mr-2 h-3.5 w-3.5", opt.color)} /> {opt.label}</CommandItem>
                                            ))}</CommandGroup></CommandList></Command>
                                          </PopoverContent>
                                        </Popover>
                                      )
                                    })()}

                                    {/* Assignee Button */}
                                    <Popover modal={true}>
                                      <PopoverTrigger asChild>
                                        <button className={cn("flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border transition-colors", task.assignee ? "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10" : "text-zinc-400 border-dashed border-zinc-300 dark:border-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-400")}>
                                          <User className="h-3 w-3" />
                                          <span className="truncate max-w-[60px]">{task.assignee ? task.assignee.name : "Unassigned"}</span>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="p-0 w-[200px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-50 shadow-xl" align="start">
                                        <Command className="bg-transparent"><CommandInput placeholder="Search..." className="h-8 border-none text-xs" /><CommandList><CommandGroup>{mockMembers.map(m => (
                                          <CommandItem key={m.id} onSelect={() => updateTask(task._id, 'assignee', m)} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer text-xs"><Avatar className="h-4 w-4 mr-2"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>{m.name}</CommandItem>
                                        ))}</CommandGroup></CommandList></Command>
                                      </PopoverContent>
                                    </Popover>

                                    {/* Estimate Button */}
                                    <Popover modal={true}>
                                      <PopoverTrigger asChild>
                                        <button className={cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors", task.estimate ? "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300" : "text-zinc-400 dark:text-zinc-600")}>
                                          <Triangle className="h-2.5 w-2.5" />
                                          <span>{task.estimate ? `${task.estimate}h` : '-'}</span>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[140px] p-2 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-50 shadow-xl" align="start">
                                        <div className="flex flex-wrap gap-1">{estimates.map(est =>
                                          <div
                                            key={est}
                                            onClick={() => updateTask(task._id, 'estimate', est)} // est là number ✅
                                            className="..."
                                          >
                                            {est}h
                                          </div>
                                        )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>

                                    {/* [CẬP NHẬT] Start Date */}
                                    {task.startDate && (
                                      <div className="flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/5">
                                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">S:</span>
                                        {format(new Date(task.startDate), "dd/MM/yyyy")}
                                      </div>
                                    )}

                                    {/* [CẬP NHẬT] End Date */}
                                    {task.endDate && (
                                      <div className="flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/5">
                                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">E:</span>
                                        {format(new Date(task.endDate), "dd/MM/yyyy")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>

        {/* ... (Dialog code bên dưới giữ nguyên vì đã ok) ... */}
        {/* DIALOG TẠO MỚI */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white sm:max-w-[750px] shadow-2xl p-0 gap-0 overflow-visible sm:rounded-xl outline-none [&>button]:hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.01] rounded-t-xl">
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {editTask
                    ? "Chỉnh sửa công việc"
                    : parentTaskForSub
                      ? "Thêm công việc con"
                      : "Thêm công việc mới"}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-zinc-500"><span className="font-medium">Tên dự án</span>{parentTaskForSub && <><span>/</span><span className="text-indigo-500 dark:text-indigo-400">Thuộc: {parentTaskForSub.title}</span></>}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full"><X className="h-5 w-5" /></Button>
            </div>

            {/* Inputs */}
            <div className="px-6 py-6 min-h-[220px] space-y-6">
              <Input
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                className="bg-transparent border-none text-xl font-semibold px-0 placeholder:text-zinc-400 focus-visible:ring-0 shadow-none h-auto py-2"
                placeholder={parentTaskForSub ? "Nhập tên công việc con..." : "Tiêu đề công việc..."}
                autoFocus
              />
              <Textarea
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                className="bg-transparent border-none text-sm text-zinc-700 dark:text-zinc-300 px-0 placeholder:text-zinc-400 focus-visible:ring-0 shadow-none resize-none min-h-[120px] leading-relaxed"
                placeholder="Thêm mô tả chi tiết..."
              />
            </div>

            {/* Actions Bar */}
            <div className="px-4 py-4 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-200 dark:border-white/5 flex items-center justify-between rounded-b-xl">
              <div className="flex flex-wrap items-center gap-2">

                {/* 1. Status */}
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                      <createStatus.icon className={cn("h-3.5 w-3.5", createStatus.color)} />
                      {createStatus.label}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[200px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                    <Command className="bg-transparent">
                      <CommandList>
                        <CommandGroup>
                          {STATUS_OPTIONS.map((opt) => (
                            <CommandItem key={opt.value} onSelect={() => setNewTaskData({ ...newTaskData, status: opt.value })} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-white/10">
                              <opt.icon className={cn("mr-2 h-4 w-4", opt.color)} /> {opt.label}
                              {newTaskData.status === opt.value && <CheckCircle2 className="ml-auto h-4 w-4 opacity-50" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* 2. Importance */}
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                      <createImportance.icon className={cn("h-3.5 w-3.5", createImportance.color)} />
                      {createImportance.label}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[200px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                    <Command className="bg-transparent">
                      <CommandList>
                        <CommandGroup>
                          {IMPORTANCE_OPTIONS.map((opt) => (
                            <CommandItem key={opt.value} onSelect={() => setNewTaskData({ ...newTaskData, priority: opt.value })} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-white/10">
                              <opt.icon className={cn("mr-2 h-4 w-4", opt.color)} /> {opt.label}
                              {newTaskData.priority === opt.value && <CheckCircle2 className="ml-auto h-4 w-4 opacity-50" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* 3. Assignee */}
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      {newTaskData.assignee ? newTaskData.assignee.name : "Assignee"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[220px] bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 z-[100] shadow-xl" align="start">
                    <Command className="bg-transparent">
                      <CommandInput placeholder="Search user..." className="h-9 border-none focus:ring-0" />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {mockMembers.map(m => (
                            <CommandItem key={m.id} onSelect={() => setNewTaskData({ ...newTaskData, assignee: m })} className="hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-white/10">
                              <Avatar className="h-5 w-5 mr-2"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
                              {m.name}
                              {newTaskData.assignee?._id === m._id && <CheckCircle2 className="ml-auto h-4 w-4 opacity-50" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* 4. Estimate */}
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                      <Triangle className="h-3.5 w-3.5 text-zinc-500" />
                      {newTaskData.estimate ? `${newTaskData.estimate}h` : "Est"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[150px] p-2 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-[100] shadow-xl" align="start">
                    <Input
                      type="number"
                      placeholder="Points..."
                      className="h-8 bg-transparent border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white mb-2"
                      onChange={(e) => setNewTaskData({ ...newTaskData, estimate: Number(e.target.value) })}
                    />
                    <div className="flex flex-wrap gap-1">
                      {estimates.map(est => (
                        <div key={est} onClick={() => setNewTaskData({ ...newTaskData, estimate: est })} className="px-2 py-1 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs text-zinc-700 dark:text-zinc-300 rounded cursor-pointer border border-transparent">{est}</div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* 5. Start Date */}
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                      <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                      {newTaskData.startDate ? format(newTaskData.startDate, "dd/MM/yyyy") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-[100] shadow-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={newTaskData.startDate || undefined}
                      onSelect={(d) => {


                        if (d && newTaskData.endDate && toDateOnly(d) > toDateOnly(newTaskData.endDate)) {
                          toast.error("Ngày bắt đầu không được sau ngày kết thúc");
                          return;
                        }

                        setNewTaskData({
                          ...newTaskData,
                          startDate: d ?? null
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {/* 6. End Date */}
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium gap-2 text-zinc-700 dark:text-zinc-300 shadow-sm dark:shadow-none">
                      <CalendarIcon className="h-3.5 w-3.5 text-zinc-500" />
                      {newTaskData.endDate ? format(newTaskData.endDate, "dd/MM/yyyy") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-white/10 z-[100] shadow-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={newTaskData.endDate || undefined}
                      onSelect={(d) => {
                        if (d && newTaskData.startDate && toDateOnly(d) < toDateOnly(newTaskData.startDate)) {
                          toast.error("Ngày kết thúc không được trước ngày bắt đầu");
                          return;
                        }


                        setNewTaskData({
                          ...newTaskData,
                          endDate: d ?? null
                        });
                      }}
                    />

                  </PopoverContent>
                </Popover>

              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 h-8 text-xs font-medium">Hủy bỏ</Button>
                <Button onClick={handleSubmitTask} disabled={isSaving} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold h-8 px-4 rounded-lg shadow-md border-0">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editTask ? "Lưu thay đổi" : "Lưu"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* DETAIL PANEL */}
        {selectedTask && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <TaskDetailPanel
                task={selectedTask}
                tasks={tasks}
                onClose={() => setSelectedTask(null)}
                onUpdate={updateTask}
                onCreateSubtask={() => openCreateDialog('Todo', selectedTask)}
              />
            </div>
          </div>
        )}

      </div>
    </TooltipProvider>
  );
}