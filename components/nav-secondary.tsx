'use client';

import * as React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { IMenuSideBarNav } from '@/models/menu-sidebar.model';
import DynamicIcon from '@/components/parts/dynamic-icon';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function NavSecondary({
  items,
  ...props
}: {
  items: IMenuSideBarNav[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup {...props} className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                size="sm" 
                tooltip={t(item.title)}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <a href={item.url} className="flex items-center gap-2">
                  <DynamicIcon 
                    name={item.icon} 
                    className="size-4" 
                  />
                  {!isCollapsed && (
                    <span className="text-xs font-medium">
                      {t(item.title)}
                    </span>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
