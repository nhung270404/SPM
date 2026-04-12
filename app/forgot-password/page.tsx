import React from 'react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout size="xl">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}