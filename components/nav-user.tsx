'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User 
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { GET_METHOD } from '@/lib/req';
import { useRouter } from 'next/navigation';
import { IUser } from '@/models/user.model';
import { cn } from '@/lib/utils';

export function NavUser({ user }: { user: IUser }) {
  const { isMobile, state } = useSidebar();
  const router = useRouter();
  const isCollapsed = state === 'collapsed';

  // Ép kiểu tạm để tránh lỗi đỏ nếu chưa update model
  const safeUser = user as any;

  return (
    user && (
      <div className="px-2 py-3 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    "relative h-14 w-full rounded-xl transition-colors duration-200",
                    "hover:bg-white/10 text-sidebar-foreground",
                    isCollapsed ? "justify-center px-0" : "px-3"
                  )}
                  tooltip={`${user.firstname} ${user.lastname}`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-9 w-9 rounded-lg border-2 border-primary/20 shadow-sm">
                      <AvatarImage src={user.avatar} alt={`${user.firstname} ${user.lastname}`} />
                      <AvatarFallback className="rounded-lg bg-white text-primary font-bold text-xs uppercase">
                        {user.firstname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-green-500" />
                  </div>

                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-3 animate-in fade-in duration-300">
                        <span className="truncate font-bold text-sidebar-foreground">
                          {user.firstname} {user.lastname}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl border border-primary/30 bg-white text-sidebar-foreground shadow-2xl p-2 backdrop-blur-xl"
                side={isMobile ? 'top' : 'right'}
                align="end"
                sideOffset={12}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-3 py-3 bg-cyan-50/50 rounded-lg mb-1">
                    <Avatar className="h-10 w-10 rounded-lg border-2 border-primary/20">
                      <AvatarImage src={user.avatar} alt={`${user.firstname} ${user.lastname}`} />
                      <AvatarFallback className="rounded-lg bg-white text-primary font-bold uppercase">
                        {user.firstname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold text-sidebar-foreground">{user.firstname} {user.lastname}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-black/5" />

                <DropdownMenuSeparator className="my-1 bg-black/5" />

                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
                    onClick={() => router.push('/control/account')}
                  >
                    <BadgeCheck className="h-4 w-4 text-sidebar-foreground/70" />
                    <span className="font-medium text-sm text-sidebar-foreground">Tài khoản</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors">
                    <Bell className="h-4 w-4 text-sidebar-foreground/70" />
                    <span className="font-medium text-sm text-sidebar-foreground">Thông báo</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-black/5" />

                <DropdownMenuItem
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-rose-300 hover:bg-rose-500/20 transition-colors"
                  onClick={() => {
                    GET_METHOD(`/api/logout`).then(() => router.push('/login'));
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-bold text-sm">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    )
  );
}