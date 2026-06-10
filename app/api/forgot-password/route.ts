import { NextResponse } from 'next/server';
import { z } from 'zod';
import User from '@/models/user.model';
import '@/lib/mongo';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng').transform(v => v.trim().toLowerCase()),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải từ 6 ký tự'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, newPassword } = forgotPasswordSchema.parse(body);

    // Tìm user khớp cả Email và Số điện thoại
    const user = await User.findOne({ email, phone });

    if (!user) {
      return NextResponse.json(
        { message: 'Thông tin Email hoặc Số điện thoại không chính xác' },
        { status: 400 }
      );
    }

    // Cập nhật mật khẩu mới trực tiếp
    await user.setPassword(newPassword);
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Mật khẩu đã được đặt lại thành công!' 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }
    console.error('FORGOT PASSWORD ERROR:', error);
    return NextResponse.json(
      { message: 'Lỗi hệ thống, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
}
