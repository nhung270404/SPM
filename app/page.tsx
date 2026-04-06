import { redirect } from 'next/navigation';

export default function Home() {
  // Tự động chuyển hướng từ trang chủ "/" sang "/login"
  redirect('/login');
}
