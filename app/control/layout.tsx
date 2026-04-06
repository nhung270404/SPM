import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { IMenuSideBar } from '@/models/menu-sidebar.model';
import LangLandingLayout from '@/app/control/lang';


export default async function ManLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) {
    return redirect('/login');
  }
  const payload = await verifyToken(token);
  if (!payload) return redirect('/api/logout');
  const MenuSideBar: IMenuSideBar = {
    navMain: [
      {
        title: 'i_user',
        url: '/control/user',
        icon: 'User',
        items: [
          {
            title: 'i_create_user',
            url: '/control/user/create',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: 'i_support',
        url: '/control/support',
        icon: 'Lifebuoy',
      },
      {
        title: 'i_feedback',
        url: 'control/feedback',
        icon: 'Send',
      },
    ],
  };
  return (
    <LangLandingLayout payload={payload} menu={MenuSideBar}>{children}</LangLandingLayout>
  );
}
