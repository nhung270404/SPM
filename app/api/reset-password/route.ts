import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import User from '@/models/user.model';
import '@/lib/mongo';

const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Thiếu token' }),
  password: z
    .string({ required_error: 'Thiếu mật khẩu' })
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<Record<string, never>> }
) {
  await params;

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { token, password } =
      resetPasswordSchema.parse(body);

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    await user.setPassword(password);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    console.error('RESET PASSWORD ERROR:', error);

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}