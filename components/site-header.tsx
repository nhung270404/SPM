'use client';

import { SidebarIcon } from 'lucide-react';

import { SearchForm } from '@/components/search-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    // [CONTAINER]
    // Light: bg-[#FF8F5C] (Cam)
    // Dark: dark:bg-black (Đen)
    // Bỏ backdrop-blur, thêm transition-colors để đổi màu mượt mà
    <header className={cn(
      "sticky top-0 z-50 flex w-full items-center border-b transition-all duration-300",
      "bg-white/80 dark:bg-black/80 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 shadow-sm"
    )}>
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">

        {/* [TOGGLE BUTTON] */}
        {/* Light: Trắng - Dark: Cam */}
        <Button
          className={cn(
            "h-8 w-8 transition-all hover:scale-110",
            "text-slate-600 hover:bg-slate-100 hover:text-primary", // Light
            "dark:text-primary dark:hover:bg-slate-900 dark:hover:text-primary" // Dark
          )}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>

        {/* [SEPARATOR] */}
        <Separator
          orientation="vertical"
          className={cn(
            "mr-2 h-4",
            "bg-white/30", // Light
            "dark:bg-zinc-800" // Dark
          )}
        />

        {/* [BREADCRUMB] */}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                className={cn(
                  "transition-colors",
                  "text-slate-500 hover:text-primary", // Light
                  "dark:text-slate-400 dark:hover:text-primary" // Dark
                )}
              >
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className={cn(
              "text-white/50", // Light
              "dark:text-zinc-600" // Dark
            )} />

            <BreadcrumbItem>
              <BreadcrumbPage className={cn(
                "font-bold",
                "text-slate-900", // Light
                "dark:text-primary" // Dark (Active Item màu primary)
              )}>
                Data Fetching
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search Form */}
        <SearchForm className="w-full min-w-[300px] text-slate-900 dark:text-white sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}