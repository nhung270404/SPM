'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { POST_METHOD } from '@/lib/req';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  // [MỚI] State để lưu lỗi hiển thị lên màn hình
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // [MỚI] Kiểm tra rỗng thủ công thay vì dùng validation mặc định của trình duyệt
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setLoading(true);

    try {
      // Gọi API gửi mail
      await POST_METHOD('/api/forgot-password', { email });

      toast.success("Đã gửi link đổi mật khẩu! Vui lòng kiểm tra Email.");

      // Chờ 2s rồi quay về Login
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error(err);

      // [QUAN TRỌNG] Hiển thị thông báo lỗi chuyên nghiệp tại đây
      // (Giả lập lỗi Email không tồn tại để hiện UI)
      setError("Địa chỉ Email này không tồn tại trong hệ thống.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl w-full border-t-4 border-t-[#36caf1] animate-in fade-in zoom-in duration-500">
      <CardHeader className="text-center pb-8 pt-8 space-y-2">
        <div className="flex justify-center mb-2">
           <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 text-[#36caf1]">
              <Mail className="h-8 w-8" />
           </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Khôi phục tài khoản
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 px-6">
          Nhập email của bạn và chúng tôi sẽ giúp bạn lấy lại quyền truy cập.
        </p>
      </CardHeader>

      <CardContent className="px-8 pb-10">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Địa chỉ Email
            </Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#36caf1] transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className={cn(
                  "pl-12 h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50",
                  "text-slate-900 dark:text-white placeholder:text-slate-400",
                  "focus:border-[#36caf1] focus:ring-4 focus:ring-[#36caf1]/10 transition-all text-base",
                  error && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                )}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-[#36caf1] to-[#03bdd8] hover:opacity-90 text-white font-bold text-base rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] border-none"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <span className="flex items-center gap-2 uppercase tracking-wider">Gửi yêu cầu <Send className="h-5 w-5" /></span>}
          </Button>

          <div className="text-center pt-2">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#36caf1] dark:hover:text-cyan-400 transition-colors font-bold group">
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Quay lại đăng nhập
            </Link>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}