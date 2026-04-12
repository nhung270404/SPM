'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { POST_METHOD } from '@/lib/req';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    // [MỚI] State lưu lỗi
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // [MỚI] Kiểm tra rỗng thủ công
        if (!formData.username.trim()) {
            setError("Vui lòng nhập Email hoặc Số điện thoại của bạn.");
            return;
        }
        if (!formData.password.trim()) {
            setError("Vui lòng nhập mật khẩu của bạn.");
            return;
        }

        setLoading(true);

        try {
            await POST_METHOD('/api/login', formData);
            toast.success("Đăng nhập thành công!");
            router.push(searchParams.get('redirect') || '/control');
        } catch (err: any) {
            console.error(err);
            setError("Tài khoản hoặc mật khẩu không đúng. Vui lòng nhập lại.");
        } finally {
            setLoading(false);
        }
    };

    // --- PREMIUM GLASSMORPHISM STYLE ---
    const inputClass = cn(
        "pl-10 h-12 rounded-xl border border-slate-200/50 dark:border-white/10", 
        "bg-white/60 dark:bg-black/20 backdrop-blur-md",
        "text-slate-900 dark:text-white placeholder:text-slate-500 text-sm",
        "focus:border-[#36caf1] focus:ring-2 focus:ring-[#36caf1]/30 transition-all shadow-sm"
    );

    const iconClass = "absolute left-3 top-3.5 h-5 w-5 text-[#03bdd8] dark:text-[#36caf1] drop-shadow-sm group-focus-within:scale-110 transition-all duration-300";
    const labelClass = "text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block tracking-wide";

    return (
        <Card className="w-full relative overflow-hidden rounded-[2rem] border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl shadow-[#36caf1]/10">
            
            {/* Vệt sáng lướt qua Header (Hiệu ứng) */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#36caf1] to-transparent opacity-50" />

            {/* Header */}
            <div className="flex flex-col items-center justify-center pt-6 pb-4 px-6 border-b border-slate-200/30 dark:border-white/5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#36caf1] to-[#03bdd8] rounded-2xl shadow-lg shadow-[#36caf1]/30 flex items-center justify-center mb-3">
                    <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Đăng nhập hệ thống
                </h2>
                <div className="text-xs mt-1 text-center">
                    <span className="text-slate-500 dark:text-slate-400">Chưa có tài khoản? </span>
                    <Link href="/signup" className="text-[#03bdd8] dark:text-[#36caf1] font-bold hover:underline transition-colors">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>

            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                    <div>
                        <Label htmlFor="username" className={labelClass}>
                            Email hoặc Số điện thoại
                        </Label>
                        <div className="relative group">
                            <User className={iconClass} />
                            <Input
                                id="username"
                                placeholder="name@example.com"
                                className={cn(inputClass, error && (error.includes("Email") || error.includes("Tài khoản")) && "border-red-500 focus:border-red-500 focus:ring-red-500/10")}
                                value={formData.username}
                                onChange={e => { setFormData({...formData, username: e.target.value}); setError(''); }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block tracking-wide m-0">
                                Mật khẩu
                            </Label>
                            <Link href="/forgot-password" className="text-[11px] font-medium text-slate-500 hover:text-[#03bdd8] dark:text-slate-400 dark:hover:text-[#36caf1] transition-colors">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className={iconClass} />
                            <Input
                                id="password"
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                className={cn(inputClass, 'pr-11', error && (error.includes("mật khẩu") || error.includes("Tài khoản")) && "border-red-500 focus:border-red-500 focus:ring-red-500/10")}
                                value={formData.password}
                                onChange={e => { setFormData({...formData, password: e.target.value}); setError(''); }}
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#36caf1] transition-colors">
                                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Khu vực hiển thị lỗi */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] font-medium animate-in slide-in-from-top-1 fade-in duration-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="mt-2 pt-4 border-t border-slate-200/30 dark:border-white/5 space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-[#36caf1] to-[#03bdd8] hover:to-[#029eb5] hover:shadow-[#36caf1]/40 text-white font-bold text-[14px] rounded-xl shadow-xl shadow-[#36caf1]/20 transition-all duration-300 active:scale-[0.98] border border-white/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Đăng nhập <ArrowRight className="h-5 w-5 ml-1" />
                                </span>
                            )}
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    );
}
