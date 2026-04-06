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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { IMenuSideBarNav } from '@/models/menu-sidebar.model';
import DynamicIcon from '@/components/parts/dynamic-icon';

export function NavMain({
                          items,
                        }: {
  items: IMenuSideBarNav[];
}) {
  const { t } = useTranslation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t(item.title)}>
                {/* Vẫn giữ flex và gap-3 để icon cách đều chữ */}
                <Link href={item.url} className="flex items-center gap-3 w-full">

                  {/* 👇 LOGIC HIỂN THỊ ICON ĐƯỢC SỬA LẠI: */}
                  {/* Trường hợp 1: Icon là chuỗi tên (String) -> Dùng DynamicIcon */}
                  {typeof item.icon === 'string' ? (
                    <DynamicIcon name={item.icon} className="size-4" />
                  ) : (
                    /* Trường hợp 2: Icon là Component (LucideIcon) -> Render trực tiếp */
                    item.icon && <item.icon className="size-4" />
                  )}

                  <span className="font-medium line-clamp-1 flex-1">{t(item.title)}</span>
                </Link>
              </SidebarMenuButton>

              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{t(subItem.title)}</span>
                            </Link>
                          </SidebarMenuSubButton>
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