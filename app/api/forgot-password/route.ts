import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import User from '@/models/user.model';
import '@/lib/mongo';
import { sendResetEmail } from '@/lib/mail';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng').transform(v => v.trim().toLowerCase()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await User.findOne({ email });

    if (!user) {
      // Để bảo mật, không thông báo email không tồn tại.
      // Trả về chung một thông báo thành công dù có tìm thấy hay không.
      return NextResponse.json({ 
        success: true, 
        message: 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn khôi phục.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    await sendResetEmail(email, resetLink);

    return NextResponse.json({ 
      success: true, 
      message: 'Hướng dẫn khôi phục mật khẩu đã được gửi vào email của bạn!' 
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
