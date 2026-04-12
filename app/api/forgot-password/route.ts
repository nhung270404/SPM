import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import User from '@/models/user.model';
import '@/lib/mongo';
import { sendResetEmail } from '@/lib/mail';

const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'Email là bắt buộc',
      invalid_type_error: 'Email không hợp lệ',
    })
    .email('Email không đúng định dạng')
    .transform(v => v.trim().toLowerCase()),
});

type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;

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

    const { email }: ForgotPasswordBody =
      forgotPasswordSchema.parse(body);

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const resetUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail(user.email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message ?? 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    console.error('FORGOT PASSWORD ERROR:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}