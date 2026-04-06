'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    // Prop này tên là 'size' (chuỗi string)
    size?: 'small' | 'medium' | 'large' | 'xl';
}

// Destructuring: đổi tên 'size' thành 'layoutSize' ngay tại đây để an toàn tuyệt đối
export function AuthLayout({ children, title, subtitle, size: layoutSize = 'small' }: AuthLayoutProps) {

    // Logic chọn chiều rộng dựa trên layoutSize
    const widthClass = layoutSize === 'large' ? 'max-w-5xl' : layoutSize === 'xl' ? 'max-w-xl' : layoutSize === 'medium' ? 'max-w-lg' : 'max-w-md';

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-600">

            {/* NỀN ĐỘNG GLASSMORPHISM */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[#36caf1]/30 dark:bg-[#36caf1]/20 mix-blend-screen animate-pulse duration-10000" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-indigo-500/30 dark:bg-indigo-600/20 mix-blend-screen animate-pulse duration-7000 delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full blur-[100px] bg-[#03bdd8]/30 dark:bg-[#03bdd8]/20 mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
            </div>

            {/* CONTAINER CHÍNH */}
            {/* Áp dụng class độ rộng đã tính toán ở trên */}
            <div className={cn("w-full relative z-10 flex flex-col items-center justify-center transition-all duration-500", widthClass)}>

                {(title || subtitle) && (
                    <div className="text-center mb-6 space-y-2 animate-in slide-in-from-top-5 duration-500">
                        {title && (
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className="w-full animate-in zoom-in-95 duration-500">
                    {children}
                </div>

            </div>
        </div>
    );
}