'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import {
  Command, SquareKanban, LifeBuoy, Send, PieChart, ChevronRight, Plus, MoreHorizontal, LinkIcon, Settings2
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuAction, SidebarGroup, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import { useAppContext } from '@/context/app-context';
import { IUser } from "@/models/user.model";
import { IMenuSideBar } from "@/models/menu-sidebar.model";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: IUser;
  data: IMenuSideBar
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { config } = useAppContext();
  const { t } = useTranslation();
  const params = useParams();
  const currentProjectId = params?.id; // Lấy ID từ URL để highlight menu đang chọn
  const [projects, setProjects] = useState<any[]>([]);

  // Lấy danh sách dự án từ Database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        const mappedProjects = response.data.map((p: any) => ({
          id: p._id, // Map _id của MongoDB sang id dùng cho giao diện
          name: p.title,
          icon: '📦',
        }));
        setProjects(mappedProjects);
      } catch (error) {
        console.error("Lỗi tải sidebar projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const projectMenuStatic = {
    title: "Dự Án",
    url: "/control/projects",
    icon: SquareKanban,
    isActive: false,
  };

  const mergedNavMain = [...(props.data.navMain || []), projectMenuStatic];

  const supportMenu = [
    { title: "Hỗ trợ", url: "/control/support", icon: LifeBuoy },
    { title: "Phản hồi", url: "/control/feedback", icon: Send },
  ];

  return (
    <Sidebar className="h-svh border-r border-[#36caf1]/20 dark:border-[#36caf1]/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-3xl" {...props}>
      {/* Vệt sáng lướt qua Header (Hiệu ứng) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#36caf1] to-transparent opacity-50 z-10" />
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-[#36caf1]/10 transition-colors" asChild>
              <Link href="/control">
                <div className="bg-gradient-to-br from-[#36caf1] to-[#03bdd8] shadow-md shadow-[#36caf1]/30 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight text-slate-800 dark:text-white">
                  <span className="truncate font-medium">{config.title}</span>
                  <span className="truncate text-xs">{t('i_dashboard')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* --- SIDEBAR CONTENT: CHIA LÀM 3 PHẦN FLEXBOX --- */}
      <SidebarContent className="flex flex-col h-full overflow-hidden p-0 gap-0">

        {/* PHẦN 1: MENU CHÍNH (Cố định) */}
        <div className="flex-shrink-0 px-2 py-2">
          <NavMain items={mergedNavMain} />
          <div className="px-3 mt-2">
            <div className="h-[1px] bg-white/10 w-full" />
          </div>
        </div>

        {/* PHẦN 2: KHU VỰC DỰ ÁN (Cuộn độc lập) */}
        <div className="flex-1 flex flex-col min-h-0">
          <Collapsible defaultOpen className="flex flex-col h-full group/workspace">
            {/* TIÊU ĐỀ DỰ ÁN (Cố định) */}
            <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between group hover:bg-[#36caf1]/5 mx-2 rounded-md mt-2 transition-colors">
              <CollapsibleTrigger className="flex items-center cursor-pointer transition-colors flex-1 text-slate-700 dark:text-slate-200 hover:text-[#03bdd8] dark:hover:text-[#36caf1]">
                <span className="text-xs font-bold uppercase tracking-wider select-none">
                  Dự Án
                </span>
              </CollapsibleTrigger>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link href="/control/projects/create" title="Tạo dự án mới">
                  <SidebarMenuButton size="sm" className="h-5 w-5 rounded bg-transparent hover:bg-[#36caf1]/10 text-slate-400 hover:text-[#03bdd8] p-0 flex items-center justify-center transition-colors">
                    <Plus className="size-3.5" />
                  </SidebarMenuButton>
                </Link>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton size="sm" className="h-5 w-5 rounded bg-transparent text-zinc-400 hover:bg-white/20 hover:text-white p-0 flex items-center justify-center cursor-pointer">
                    <ChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/workspace:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </div>
            </div>

            {/* DANH SÁCH DỰ ÁN (Phần duy nhất cuộn ở giữa) */}
            <CollapsibleContent className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-2 pb-2">
              <SidebarMenu>
                {projects.map((project) => (
                  <Collapsible key={project.id} asChild className="group/project" defaultOpen={project.id === currentProjectId}>
                    <SidebarMenuItem className="relative">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "cursor-pointer pr-16 h-9 transition-all duration-200",
                            // [DEFAULT STATE]
                            // Light: Hover nền xanh nhạt
                            // Dark: Hover nền trắng mờ chữ xanh
                            "hover:bg-[#36caf1]/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",

                            // [ACTIVE STATE - ĐANG XEM] -> MÀU XANH LỤC LAM
                            project.id === currentProjectId &&
                            "bg-[#36caf1]/10 text-[#029eb5] font-bold border-r-2 border-[#36caf1] dark:bg-[#36caf1]/10 dark:text-[#36caf1]"
                          )}
                        >
                          <span className="text-base">{project.icon}</span>
                          <span className="font-medium">{project.name}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {/* Dropdown Menu 3 chấm & Mũi tên */}
                      <div className="absolute right-1.5 top-0 bottom-0 flex items-center gap-0.5 opacity-0 group-hover/project:opacity-100 transition-opacity z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            {/* Nút 3 chấm: Hover ra màu xanh */}
                            <SidebarMenuAction className="h-7 w-7 flex items-center justify-center rounded-md transition-colors mr-8 hover:bg-[#36caf1]/10 text-slate-500 dark:text-slate-400 hover:text-[#03bdd8]" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                              <MoreHorizontal className="size-4" />
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>

                          {/* Dropdown Content: Nền Trắng (Light) / Đen (Dark) */}
                          <DropdownMenuContent align="end" side="right" className="w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl shadow-xl shadow-[#36caf1]/10 p-1">
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#36caf1]/10 focus:text-[#03bdd8] dark:focus:bg-white/10 dark:focus:text-[#36caf1] py-2.5 rounded-lg transition-colors" onClick={() => { const link = `${window.location.origin}/control/projects/${project.id}`; navigator.clipboard.writeText(link); alert("Đã sao chép liên kết dự án!"); }}>
                              <LinkIcon className="size-4 opacity-70" /><span>Sao chép liên kết</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#36caf1]/10 focus:text-[#03bdd8] dark:focus:bg-white/10 dark:focus:text-[#36caf1] py-2.5 rounded-lg transition-colors" asChild>
                              <Link href={`/control/projects/${project.id}/settings`}><Settings2 className="size-4 opacity-70" /><span>Cài đặt</span></Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mũi tên mở rộng */}
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="h-7 w-7 flex items-center justify-center rounded-md transition-all data-[state=open]:rotate-90 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400">
                            <ChevronRight className="size-3.5" />
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent>
                                {/* Đường kẻ dọc: Chạy theo style */}
                        <SidebarMenuSub className="border-l border-slate-200 dark:border-white/10 ml-4">

                          {/* --- LINK WORK ITEMS --- */}
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={`/control/projects/${project.id}/workitems`}
                                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#03bdd8] dark:hover:text-[#36caf1] transition-colors"
                              >
                                <SquareKanban className="size-3.5" /><span>WorkItem</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                          {/* --- LINK STATISTICS --- */}
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={`/control/projects/${project.id}/statistics`}
                                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#03bdd8] dark:hover:text-[#36caf1] transition-colors"
                              >
                                <PieChart className="size-3.5" /><span>Thống kê</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}

                {projects.length === 0 && (
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 px-4 py-2 italic text-center opacity-70">
                    Đang load dự án...
                  </div>
                )}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="px-5">
          <div className="h-[1px] bg-white/10 w-full" />
        </div>

        {/* PHẦN 3: MENU ĐÁY (Cố định) */}
        <div className="flex-shrink-0 mt-auto px-2 py-2">
          <NavSecondary items={supportMenu} />
        </div>

      </SidebarContent>

      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}