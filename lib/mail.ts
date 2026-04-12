import nodemailer from 'nodemailer';

export async function sendResetEmail(email: string, link: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Đặt lại mật khẩu',
    html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
      <p>
        <a href="${link}" style="color:#4f46e5;font-weight:bold">
          Nhấn vào đây để đặt lại mật khẩu
        </a>
      </p>
      <p>Link sẽ hết hạn sau 15 phút.</p>
    `,
  });
}
