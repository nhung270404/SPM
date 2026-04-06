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
					<div className="p-4 md:hidden">
						{/* Nút bấm Menu dành cho thiết bị di động */}
						<SidebarTrigger />
					</div>
					<div className="p-3">
						{children}
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}