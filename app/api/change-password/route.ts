import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/user.model';
import dbConnect from '@/lib/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

async function getAuthenticatedUser() {
    const cc = await cookies();
    const token = cc.get('accessToken')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as any;
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        // Cần lấy cả password để verify
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await user.validPassword(currentPassword);
        if (!isMatch) {
            return NextResponse.json({ success: false, message: 'Mật khẩu hiện tại không chính xác' }, { status: 400 });
        }

        // Đặt mật khẩu mới
        await user.setPassword(newPassword);
        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Đổi mật khẩu thành công' 
        });

    } catch (error: any) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Lỗi máy chủ: ' + error.message 
        }, { status: 500 });
    }
}
