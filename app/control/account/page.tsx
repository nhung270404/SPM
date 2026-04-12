'use client'
import { AccountView } from '@/components/control/account/account-view';
import { useUser } from '@/context/user-context'

export default function AccountPage() {
  // Sau này có thể fetch data ở đây và truyền vào AccountView
  const {loading } = useUser()

  if (loading) {
    return <div className="p-6 text-white">Đang tải thông tin...</div>
  }
  return <AccountView />;
}