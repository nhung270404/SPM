import * as React from 'react';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { IMenuSideBarNav } from '@/models/menu-sidebar.model';
import DynamicIcon from '@/components/parts/dynamic-icon';
import { useTranslation } from 'react-i18next';

export function NavSecondary({
  items,
  ...props
}: {
  items: IMenuSideBarNav[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const {t} = useTranslation();
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  <DynamicIcon name={item.icon} />
                  <span>{t(item.title)}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
