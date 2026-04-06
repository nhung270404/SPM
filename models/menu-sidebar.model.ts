export interface IMenuSideBar {
	navMain: IMenuSideBarNav[]
	navSecondary: IMenuSideBarNav[]
}

export interface IMenuSideBarNav extends IMenuSideBarItem {
	items?: IMenuSideBarItem[]
	icon: string
	isActive?: boolean
}

export interface IMenuSideBarItem {
	title: string
	url: string
}