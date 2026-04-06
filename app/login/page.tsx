import React from 'react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
    return (
        // Sử dụng AuthLayout với cùng kiểu nền Lava, bỏ đi title/subtitle bên ngoài vì bên trong Form đã có Header xử lý
        <AuthLayout size="small">
            <LoginForm />
        </AuthLayout>
    );
}