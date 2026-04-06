'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User // 👈 Import thêm icon User
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

export function NavUser({ user }: { user: IUser }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Ép kiểu tạm để tránh lỗi đỏ nếu chưa update model
  const safeUser = user as any;

  return (
    user && (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-white/20 data-[state=open]:text-white hover:bg-white/10 transition-colors"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={safeUser.avatar} alt={safeUser.name || user.phone} />

                  {/* 👇 SỬA Ở ĐÂY: Fallback giờ là Icon User thay vì chữ */}
                  <AvatarFallback className="rounded-lg bg-indigo-500 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">
                    {safeUser.name || user.phone}
                  </span>
                  <span className="truncate text-xs text-white/70">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-white/70" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-white/20 bg-white/20 dark:bg-black/30 backdrop-blur-xl shadow-2xl"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={safeUser.avatar} alt={safeUser.name || user.phone} />
                    <AvatarFallback className="rounded-lg bg-indigo-500 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">{safeUser.name || user.phone}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuGroup>
                <DropdownMenuItem className="hover:bg-white/20 focus:bg-white/20 cursor-pointer transition-colors">
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="hover:bg-white/20 focus:bg-white/20 cursor-pointer transition-colors"
                  onClick={() => router.push('/control/account')}
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>

                <DropdownMenuItem className="hover:bg-white/20 focus:bg-white/20 cursor-pointer transition-colors">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>

                <DropdownMenuItem className="hover:bg-white/20 focus:bg-white/20 cursor-pointer transition-colors">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer transition-colors"
                onClick={() => {
                  GET_METHOD(`/api/logout`).then(() => router.push('/control'));
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  );
}