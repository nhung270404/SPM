import nodemailer from 'nodemailer';

export async function sendResetEmail(email: string, link: string) {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error('MAIL_USER hoặc MAIL_PASS chưa được cấu hình');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Kiểm tra kết nối SMTP
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Khôi phục mật khẩu</h2>

          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>

          <p>
            <a
              href="${link}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#4f46e5;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Đặt lại mật khẩu
            </a>
          </p>

          <p>Liên kết này sẽ hết hạn sau 15 phút.</p>

          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        </div>
      `,
    });

    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ SEND MAIL ERROR:', error);
    throw error;
  }
}