'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, usePathname } from 'next/navigation';
import {
  Bell, Command, SquareKanban, LifeBuoy, Send, PieChart, ChevronRight, Plus, MoreHorizontal, LinkIcon, Settings2, LayoutDashboard, Bot
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
  const pathname = usePathname();
  const { state } = useSidebar();

  const projectMenuStatic = {
    title: "Dự Án",
    url: "/control/projects",
    icon: SquareKanban,
    isActive: pathname.startsWith('/control/projects'),
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
    projectMenuStatic,
    {
      title: 'Thống kê',
      url: '/control/statistics',
      icon: PieChart,
      isActive: pathname.startsWith('/control/statistics'),
    },
    {
      title: 'Thông báo',
      url: '/control/notifications',
      icon: Bell,
      isActive: pathname.startsWith('/control/notifications'),
    },
    {
      title: 'Hỗ trợ',
      url: '/control/support',
      icon: Bot,
      isActive: pathname.startsWith('/control/support'),
    },
  ];

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar 
      collapsible="icon" 
      className="h-svh border-r-0 transition-all duration-300 ease-in-out" 
      {...props}
    >
      <SidebarHeader className={cn("transition-all duration-300", isCollapsed ? "px-0 py-4" : "p-4")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className={cn(
                "transition-all duration-300 rounded-xl h-12 flex items-center",
                isCollapsed ? "justify-center p-0" : "hover:bg-white/10 px-3"
              )} 
              asChild 
              tooltip={config.title}
            >
              <Link href="/control">
                <div className="bg-white text-sidebar flex aspect-square size-10 items-center justify-center rounded-xl flex-shrink-0 shadow-md overflow-hidden">
                  <img src="/logo.png" alt="ZenWork Logo" className="size-full object-contain p-1.5" />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full p-0 gap-2 overflow-y-auto no-scrollbar">
        <div className={cn(
          "flex-shrink-0 mt-6 space-y-6",
          isCollapsed ? "px-0" : "px-2"
        )}>
          <NavMain items={mergedNavMain} />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-white/10">
        <NavUser user={props.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}