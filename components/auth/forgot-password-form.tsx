'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { POST_METHOD } from '@/lib/req';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError("Vui lòng điền địa chỉ email của bạn.");
      return;
    }

    setLoading(true);

    try {
      const res: any = await POST_METHOD('/api/forgot-password', { email });

      setSuccess(true);
      toast.success("Yêu cầu đã được gửi!", { position: 'top-center' });

    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.message;
      setError(serverMessage || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl w-full border-t-4 border-t-[#36caf1] animate-in fade-in zoom-in duration-500">
      <CardHeader className="text-center pb-6 pt-8 space-y-2">
        <div className="flex justify-center mb-2">
           <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 text-[#36caf1]">
              <Mail className="h-8 w-8" />
           </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Khôi phục mật khẩu
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 px-6">
          Nhập địa chỉ email của bạn, chúng tôi sẽ gửi một đường dẫn để giúp bạn đặt lại mật khẩu.
        </p>
      </CardHeader>

      <CardContent className="px-8 pb-10">
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label className="text-[12px] font-bold text-slate-500 uppercase ml-1">Email của bạn</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-950/50"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px] font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-13 bg-gradient-to-r from-[#36caf1] to-[#03bdd8] hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] border-none mt-2 uppercase tracking-wide"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Gửi liên kết khôi phục"}
            </Button>

            <div className="text-center pt-4">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#36caf1] font-bold group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kiểm tra hộp thư của bạn</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chúng tôi đã gửi một liên kết khôi phục mật khẩu tới địa chỉ <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. Vui lòng kiểm tra cả thư mục Spam nếu không thấy.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#36caf1] font-bold group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Về trang đăng nhập
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}