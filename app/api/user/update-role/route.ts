import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import dbConnect from '@/lib/mongo';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

async function getAuthenticatedUser() {
    const cc = await cookies();
    const token = cc.get('accessToken')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const currentUserId = await getAuthenticatedUser();
    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify if current user is admin
    const currentUser = await User.findById(currentUserId).populate('roles');
    const isAdmin = currentUser?.roles?.some((r: any) => r.level <= 1);
    
    if (!isAdmin) {
      return NextResponse.json({ message: 'Chỉ Quản trị viên mới có quyền thực hiện thao tác này' }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body;

    if (!id || !['promote', 'demote'].includes(action)) {
      return NextResponse.json({ message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    // Không cho phép tự giáng chức mình
    if (id === currentUserId && action === 'demote') {
      return NextResponse.json({ message: 'Bạn không thể tự hạ cấp chính mình' }, { status: 400 });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const adminRole = await Role.findOne({ name: 'admin' });
    const memberRole = await Role.findOne({ name: 'member' });

    if (!adminRole || !memberRole) {
      return NextResponse.json({ message: 'Lỗi hệ thống: Chưa khởi tạo Roles' }, { status: 500 });
    }

    if (action === 'promote') {
      targetUser.roles = [adminRole._id];
    } else if (action === 'demote') {
      targetUser.roles = [memberRole._id];
    }

    await targetUser.save();

    const actionText = action === 'promote' ? 'Thăng cấp Quản trị viên' : 'Hạ cấp Thành viên';

    return NextResponse.json({ 
        success: true, 
        message: `${actionText} thành công cho ${targetUser.lastname} ${targetUser.firstname}!`
    });
  } catch (error: unknown) {
    console.error('UPDATE ROLE ERROR:', error);
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json({ message }, { status: 500 });
  }
}
