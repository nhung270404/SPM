'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { IMenuSideBarNav } from '@/models/menu-sidebar.model';
import DynamicIcon from '@/components/parts/dynamic-icon';
import { cn } from '@/lib/utils';

export function NavMain({
                           items,
                         }: {
  items: IMenuSideBarNav[];
}) {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/50">
          Danh mục chính
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="gap-2">
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={t(item.title)}
                className={cn(
                  "relative h-11 px-3 transition-colors duration-200 group/item",
                  item.isActive 
                    ? "sidebar-active-protrude text-primary font-bold hover:text-primary" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl"
                )}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center size-8 rounded-lg transition-colors duration-200",
                    item.isActive ? "bg-cyan-100" : "bg-sidebar-accent/50"
                  )}>
                    {typeof item.icon === 'string' ? (
                      <DynamicIcon name={item.icon} className={cn("size-4 shrink-0", item.isActive ? "text-primary" : "text-sidebar-foreground")} />
                    ) : (
                      item.icon && <item.icon className={cn("size-4 shrink-0", item.isActive ? "text-primary" : "text-sidebar-foreground")} />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm truncate">
                      {t(item.title)}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>

              {item.items?.length && !isCollapsed ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className={cn(
                      "transition-transform duration-200",
                      item.isActive ? "text-primary/70 hover:text-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
                    )}>
                      <ChevronRight className="size-4" />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-8 mt-1 border-l border-white/10 space-y-1">
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <Link href={subItem.url} className="block py-2 px-3 text-[13px] font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                            {t(subItem.title)}
                          </Link>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}