import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import dbConnect from '@/lib/mongo';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID người dùng' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
    }

    // Toggle status between active and inactive
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    const actionText = user.status === 'active' ? 'Khôi phục' : 'Vô hiệu hóa';

    return NextResponse.json({ 
        success: true, 
        message: `${actionText} tài khoản thành công!`,
        newStatus: user.status
    });
  } catch (error: unknown) {
    console.error('TOGGLE STATUS ERROR:', error);

    const message =
        error instanceof Error ? error.message : 'Lỗi hệ thống';

    return NextResponse.json(
        {
          message,
        },
        { status: 500 }
    );
  }
}
