import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/services/user.service';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Kiểm tra quyền truy cập (Chỉ cho phép người dùng đã đăng nhập)
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // 2. Lấy danh sách người dùng
    const users = await getAllUsers();

    // 3. Trả về kết quả
    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
