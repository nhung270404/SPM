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
      "sticky top-0 z-50 flex w-full items-center border-b transition-colors duration-300",
      "bg-[#FF8F5C] border-orange-700/10", // Light Mode Styles
      "dark:bg-black dark:border-zinc-800"  // Dark Mode Styles
    )}>
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">

        {/* [TOGGLE BUTTON] */}
        {/* Light: Trắng - Dark: Cam */}
        <Button
          className={cn(
            "h-8 w-8 transition-colors",
            "text-white hover:bg-white/20 hover:text-white", // Light
            "dark:text-orange-500 dark:hover:bg-zinc-900 dark:hover:text-orange-400" // Dark
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
                  "text-white/80 hover:text-white", // Light
                  "dark:text-zinc-400 dark:hover:text-orange-500" // Dark
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
                "font-medium",
                "text-white", // Light
                "dark:text-orange-500" // Dark (Active Item màu cam)
              )}>
                Data Fetching
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search Form */}
        <SearchForm className="w-full min-w-[300px] text-white sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}