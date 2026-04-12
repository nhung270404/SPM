import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { IMenuSideBar } from '@/models/menu-sidebar.model';
import LangLandingLayout from '@/app/control/lang';
import { getMeById } from '@/lib/services/auth.service';
import { IUser } from '@/models/user.model';


export default async function ManLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) {
    return redirect('/login');
  }
  const payload = await verifyToken(token);
  if (!payload) return redirect('/api/logout');

  // Lấy User đầy đủ từ DB để có firstname/lastname ngay lập tức
  let user: IUser;
  try {
    user = await getMeById((payload as any).userId) as any;
  } catch (error) {
    return redirect('/api/logout');
  }
  const MenuSideBar: IMenuSideBar = {
    navMain: [
      {
        title: 'Người dùng',
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
  // Chuyển đổi sang Plain Object để có thể truyền từ Server sang Client Component
  const serializableUser = JSON.parse(JSON.stringify(user));

  return (
    <LangLandingLayout payload={serializableUser} menu={MenuSideBar}>{children}</LangLandingLayout>
  );
}
