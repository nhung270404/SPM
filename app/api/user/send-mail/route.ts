import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, subject, message } = body;

    if (!email || !subject || !message) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return NextResponse.json(
        { message: 'Hệ thống chưa cấu hình email gửi (MAIL_USER/MAIL_PASS)' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Smart SPM" <${process.env.MAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family:Arial,sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #03bdd8;">Thông báo từ Hệ thống Smart SPM</h2>
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Đây là email tự động từ hệ thống Smart SPM. Vui lòng không trả lời trực tiếp email này.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Gửi email thành công!' });
  } catch (error: unknown) {
    console.error('SEND MAIL ERROR:', error);

    const message =
        error instanceof Error ? error.message : 'Lỗi hệ thống khi gửi mail';

    return NextResponse.json(
        {
          message,
        },
        { status: 500 }
    );
  }
}
