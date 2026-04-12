import React from 'react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Thiết lập mật khẩu"
      subtitle="Hãy chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn."
      size="small"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}