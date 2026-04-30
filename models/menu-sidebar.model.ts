export interface IMenuSideBar {
	navMain: IMenuSideBarNav[]
	navSecondary: IMenuSideBarNav[]
}

export interface IMenuSideBarNav extends IMenuSideBarItem {
	items?: IMenuSideBarItem[]
	icon: string | any
	isActive?: boolean
	badge?: string | number
}

export interface IMenuSideBarItem {
	title: string
	url: string
}