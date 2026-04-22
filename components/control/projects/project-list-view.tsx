'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import {
  Plus, Search, LayoutGrid, MoreHorizontal, Users, RefreshCcw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import Dialog
import { ProjectCreateDialog } from './project-create-dialog';

interface Member {
  name: string;
  avatar: string;
}

interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: string;
  members: Member[];
  dueDate: string;
}

export function ProjectListView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const router = useRouter();

  const fetchProjects = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await axios.get('/api/projects');
      const mappedData = response.data.map((p: any) => ({
        ...p,
        members: (p.members || []).map((m: any) => ({
          ...m,
          name: `${m.lastname} ${m.firstname}`.trim() || m.email || "Unknown"
        }))
      }));
      setProjects(mappedData);
    } catch (error) {
      console.error("Lỗi API:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjects(false);
    toast.success("Đã làm mới dữ liệu");
  };

  // --- STYLE CLASSES ---
  const cardClass = cn(
    "group cursor-pointer relative overflow-hidden transition-all duration-500",
    "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md",
    "border border-slate-200/50 dark:border-slate-800/50",
    "hover:border-primary/50 dark:hover:border-primary/50",
    "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(54,202,241,0.15)] hover:-translate-y-2",
    "rounded-3xl"
  );

  const inputClass = cn(
    "pl-10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm",
    "border border-slate-200 dark:border-slate-800",
    "text-slate-900 dark:text-white placeholder:text-slate-400",
    "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-2xl"
  );

  return (
    // [FIX QUAN TRỌNG]
    // 1. h-[calc(100vh-4rem)]: Chiều cao = Màn hình - (Chiều cao Topbar ~64px).
    //    Nếu Topbar của cậu cao hơn hoặc thấp hơn, hãy chỉnh số 4rem này (ví dụ 3.5rem hoặc 5rem).
    // 2. overflow-hidden: Cắt bỏ mọi thứ thừa ra ngoài, bắt buộc con phải cuộn bên trong.
    <div className="flex flex-col w-full bg-slate-50/30 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden h-[calc(100vh-5.1rem)]">

      {/* HEADER: Premium Glassmorphism Redesign */}
      <div className="flex-none p-8 pb-6 space-y-6 bg-white/70 dark:bg-black/40 backdrop-blur-2xl z-20 border-b border-white/20 dark:border-white/5 relative overflow-hidden">
        {/* Subtle Background Glow for Header */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-[1.5rem] bg-white flex items-center justify-center shadow-xl shadow-cyan-500/20 ring-4 ring-white dark:ring-white/5 overflow-hidden transition-transform duration-500 hover:scale-105">
              <img src="/logo.png" alt="ZenWork Logo" className="h-12 w-12 object-contain" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Dự án
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <div className="absolute inset-0 bg-cyan-500/5 group-focus-within:bg-cyan-500/10 rounded-2xl transition-colors pointer-events-none" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
              <Input 
                type="search" 
                placeholder="Tìm kiếm dự án..."
                className="pl-11 h-12 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/50 transition-all rounded-2xl shadow-sm" 
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="border border-white/20 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 hover:text-cyan-500 hover:border-cyan-500/50 transition-all rounded-2xl h-12 w-12 shadow-sm"
            >
              <RefreshCcw className={cn("h-5 w-5", isRefreshing && "animate-spin text-cyan-500")} />
            </Button>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold shadow-lg shadow-cyan-500/30 border-0 h-12 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" /> Tạo dự án
            </Button>
          </div>
        </div>
      </div>

      {/* [FIX QUAN TRỌNG] CONTENT:
          - min-h-0: Bắt buộc để scroll hoạt động trong Flexbox lồng nhau.
          - overflow-y-auto: Tạo thanh cuộn riêng cho vùng này.
      */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">

          {/* Loading Skeletons */}
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[220px] rounded-xl bg-zinc-200 dark:bg-zinc-900 animate-pulse border-2 border-transparent" />
          ))}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400">
              <LayoutGrid className="h-16 w-16 mb-4 opacity-20" />
              <p>Chưa có dự án nào. Hãy tạo dự án đầu tiên!</p>
            </div>
          )}

          {/* Projects List */}
          {!isLoading && projects.map((project) => (
            <Card
              key={project._id || project.id}
              onClick={() => router.push(`/control/projects/${project._id || project.id}/workitems`)}
              className={cardClass}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-transparent to-transparent dark:from-cyan-500/5 dark:via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1"></div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 -mr-2 text-slate-400 hover:text-primary hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/control/projects/${project._id || project.id}/settings`);
                    }}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>

                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2 h-14">
                  {project.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 h-10 mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <div className="px-6">
                <Separator className="bg-slate-100 dark:bg-slate-800/50" />
              </div>

              <CardFooter className="pt-4 flex justify-between items-center relative z-10">
                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                  {project.members?.slice(0, 3).map((member, i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-white dark:border-slate-900 shadow-sm">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase">
                        {member.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members?.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 border-2 border-white dark:border-slate-900 shadow-sm">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {project.members?.length || 0}
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* Create New Card */}
          {!isLoading && (
            <div
              onClick={() => setIsCreateOpen(true)}
              className="group h-full min-h-[220px] cursor-pointer"
            >
              <div className={cn(
                "h-full w-full rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-500",
                "border-2 border-dashed border-slate-200 dark:border-slate-800",
                "bg-white/40 dark:bg-white/5 backdrop-blur-sm",
                "hover:border-primary dark:hover:border-primary",
                "hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5",
                "shadow-sm hover:shadow-lg hover:shadow-cyan-500/10"
              )}>
                <div className="p-5 rounded-full bg-white dark:bg-slate-800 shadow-md group-hover:bg-primary group-hover:text-white text-slate-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-90">
                  <Plus className="h-7 w-7" />
                </div>
                <span className="font-extrabold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors tracking-wide">
                  Tạo Dự Án Mới
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProjectCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleRefresh}
      />

    </div>
  );
}