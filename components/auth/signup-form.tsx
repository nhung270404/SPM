'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupSchema } from '@/lib/schemas/signup.schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SignupForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { register, handleSubmit, setError, formState: { errors },
    } = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const checkExists = async (field: 'email' | 'phone', value: string) => {
        if (!value) return;

        try {
            const res = await fetch(`/api/check?field=${field}&value=${value}`);
            const data = await res.json();

            if (data.exists) {
                setError(field, {
                    type: 'manual',
                    message: field === 'email'
                        ? 'Email đã tồn tại'
                        : 'Số điện thoại đã tồn tại',
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (data: SignupSchema) => {
        setLoading(true);

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const result = await res.json();
                console.error("Lỗi từ server:", result);

                if (result?.errors) {
                    Object.entries(result.errors).forEach(([field, message]) => {
                        setError(field as keyof SignupSchema, {
                            type: 'server',
                            message: message as string,
                        });
                    });
                } else if (result?.message) {
                    toast.error(result.message);
                } else {
                    toast.error('Đăng ký thất bại');
                }
                return;
            }

            toast.success('Đăng ký thành công!');
            setTimeout(() => router.push('/login'), 800);
        } catch (err) {
            console.error("Lỗi ngoại lệ:", err);
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // --- PREMIUM GLASSMORPHISM STYLE ---
    const inputClass = cn(
        "pl-10 h-12 rounded-xl border border-slate-200/50 dark:border-white/10", 
        "bg-white/60 dark:bg-black/20 backdrop-blur-md", // Mờ ảo
        "text-slate-900 dark:text-white placeholder:text-slate-500 text-sm",
        "focus:border-[#36caf1] focus:ring-2 focus:ring-[#36caf1]/30 transition-all shadow-sm"
    );

    const iconClass = "absolute left-3 top-3.5 h-5 w-5 text-[#03bdd8] dark:text-[#36caf1] drop-shadow-sm group-focus-within:scale-110 transition-all duration-300";
    const labelClass = "text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block tracking-wide";
    const errorText = "mt-1.5 text-[11px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1";

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
                    Tạo tài khoản mới
                </h2>
                <div className="text-xs mt-1 text-center">
                    <span className="text-slate-500 dark:text-slate-400">Đã có tài khoản? </span>
                    <Link href="/login" className="text-[#03bdd8] dark:text-[#36caf1] font-bold hover:underline transition-colors">
                        Đăng nhập
                    </Link>
                </div>
            </div>

            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

                    {/* HÀNG 1: HỌ VÀ TÊN (2 Ô BẰNG NHAU) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className={labelClass}>Họ</Label>
                            <div className="relative group">
                                <User className={iconClass} />
                                <Input {...register('lastname')} placeholder="VD: Nguyễn Văn" className={inputClass} />
                            </div>
                            {errors.lastname && <p className={errorText}>{errors.lastname.message}</p>}
                        </div>
                        <div>
                            <Label className={labelClass}>Tên</Label>
                            <div className="relative group">
                                <User className={iconClass} />
                                <Input {...register('firstname')} placeholder="VD: A" className={inputClass} />
                            </div>
                            {errors.firstname && <p className={errorText}>{errors.firstname.message}</p>}
                        </div>
                    </div>

                    {/* HÀNG 2: SỐ ĐIỆN THOẠI VÀ EMAIL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Label className={labelClass}>Số điện thoại</Label>
                            <div className="relative group">
                                <Phone className={iconClass} />
                                <Input {...register('phone')} placeholder="09xxxx..." className={inputClass} onBlur={(e) => checkExists('phone', e.target.value)} />
                            </div>
                            {errors.phone && <p className={errorText}>{errors.phone.message}</p>}
                        </div>
                        <div>
                            <Label className={labelClass}>Email</Label>
                            <div className="relative group">
                                <Mail className={iconClass} />
                                <Input {...register('email')} placeholder="email@gmail.com" className={inputClass} onBlur={(e) => checkExists('email', e.target.value)} />
                            </div>
                            {errors.email && <p className={errorText}>{errors.email.message}</p>}
                        </div>
                    </div>

                    {/* HÀNG 3: MẬT KHẨU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                        <div>
                            <Label className={labelClass}>Mật khẩu</Label>
                            <div className="relative group">
                                <Lock className={iconClass} />
                                <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className={cn(inputClass, 'pr-11')} />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#36caf1] transition-colors"
                                >
                                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className={errorText}>{errors.password.message}</p>}
                        </div>
                        <div>
                            <Label className={labelClass}>Xác nhận mật khẩu</Label>
                            <div className="relative group">
                                <CheckCircle2 className={iconClass} />
                                <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} className={cn(inputClass, 'pr-11')} />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#36caf1] transition-colors"
                                >
                                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (<p className={errorText}>{errors.confirmPassword.message}</p>)}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-4 pt-4 border-t border-slate-200/30 dark:border-white/5 space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-[#36caf1] to-[#03bdd8] hover:to-[#029eb5] hover:shadow-[#36caf1]/40 text-white font-bold text-[14px] rounded-xl shadow-xl shadow-[#36caf1]/20 transition-all duration-300 active:scale-[0.98] border border-white/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Đăng ký <ArrowRight className="h-5 w-5 ml-1" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
