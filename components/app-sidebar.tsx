'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, usePathname } from 'next/navigation';
import {
  Command, SquareKanban, LifeBuoy, Send, PieChart, ChevronRight, Plus, MoreHorizontal, LinkIcon, Settings2, LayoutDashboard
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuAction, SidebarGroup, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarRail, useSidebar,
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
  const pathname = usePathname();
  const { state } = useSidebar();
  const currentProjectId = params?.id; 
  const [projects, setProjects] = useState<any[]>([]);

  // Lấy danh sách dự án từ Database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        const mappedProjects = response.data.map((p: any) => ({
          id: p._id, 
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

  const mergedNavMain = [
    {
      title: t('Dashboard') || 'Dashboard',
      url: '/control',
      icon: LayoutDashboard,
      isActive: pathname === '/control',
    },
    {
      title: 'Người dùng',
      url: '/control/user',
      icon: 'User',
      isActive: pathname.startsWith('/control/user'),
    },
    projectMenuStatic
  ];

  const supportMenu = [
    { title: "Hỗ trợ", url: "/control/support", icon: LifeBuoy },
    { title: "Phản hồi", url: "/control/feedback", icon: Send },
  ];

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar 
      collapsible="icon" 
      className="h-svh border-r-0 transition-all duration-300 ease-in-out" 
      {...props}
    >
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="hover:bg-white/10 transition-colors rounded-xl h-12" 
              asChild 
              tooltip={config.title}
            >
              <Link href="/control" className="flex items-center justify-center">
                <div className="bg-white text-sidebar flex aspect-square size-10 items-center justify-center rounded-xl flex-shrink-0 shadow-md overflow-hidden">
                  <img src="/logo.png" alt="ZenWork Logo" className="size-full object-contain p-1.5" />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full p-0 gap-2 overflow-y-auto no-scrollbar">
        <div className="flex-shrink-0 px-2 mt-2">
          <NavMain items={mergedNavMain} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Collapsible defaultOpen className="flex flex-col h-full group/workspace">
            <div className={cn(
              "flex-shrink-0 px-4 py-3 flex items-center justify-between mx-2 rounded-xl transition-all duration-300",
              isCollapsed ? "px-2 justify-center" : "mb-1"
            )}>
              {!isCollapsed ? (
                <>
                  <CollapsibleTrigger className="flex items-center cursor-pointer flex-1 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] select-none">Dự án của bạn</span>
                  </CollapsibleTrigger>
                </>
              ) : (
                <div className="h-[1px] bg-white/20 w-full mx-2" />
              )}
            </div>

            <CollapsibleContent className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar-white">
              <SidebarMenu className="gap-1.5 px-1">
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={project.name}
                      className={cn(
                        "h-11 transition-all duration-200 px-3",
                        project.id === currentProjectId 
                          ? "sidebar-active-protrude text-primary font-bold shadow-sm" 
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl"
                      )}
                    >
                      <Link href={`/control/projects/${project.id}`} className="flex items-center">
                        <div className={cn(
                          "flex items-center justify-center size-8 rounded-lg flex-shrink-0",
                          project.id === currentProjectId ? "bg-cyan-100" : "bg-sidebar-accent/50"
                        )}>
                          <span className="text-base">{project.icon}</span>
                        </div>
                        {!isCollapsed && (
                          <span className="ml-3 font-medium text-sm truncate">
                            {project.name}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {!isCollapsed && projects.length === 0 && (
                  <div className="py-2 text-[10px] text-sidebar-foreground/40 text-center uppercase tracking-widest font-bold">
                    Đang tải dự án
                  </div>
                )}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex-shrink-0 px-2">
          <NavSecondary items={supportMenu} />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-white/10">
        <NavUser user={props.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}