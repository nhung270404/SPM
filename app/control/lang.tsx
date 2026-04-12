'use client'

import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/app-sidebar';
import {IUser} from "@/models/user.model";
import {IMenuSideBar} from "@/models/menu-sidebar.model";
import {ReactNode} from 'react';

export default function LangLandingLayout({children, payload, menu}: {
	children: ReactNode,
	payload: IUser,
	menu: IMenuSideBar
}) {
	return (
		<SidebarProvider className="flex flex-col">
			<div className="flex flex-1">
				<AppSidebar data={menu} user={payload}/>
				<SidebarInset>
					<header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b border-[#36caf1]/10 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md sticky top-0 z-20">
						<SidebarTrigger className="-ml-1 text-[#36caf1] hover:bg-[#36caf1]/10 rounded-lg transition-all" />
						<div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
						<div className="flex-1" />
					</header>
					<div className="p-3">
						{children}
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}