'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Save } from 'lucide-react';
import { POST_METHOD } from '@/lib/req';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Lấy token từ URL

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Gửi password mới + token lên server
      await POST_METHOD('/api/reset-password', { ...formData, token });

      toast.success("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Token hết hạn hoặc lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden rounded-xl">
      <CardHeader className="text-center pb-6 border-b border-slate-100 dark:border-slate-800/50 pt-6">
        <div className="text-xl font-bold text-slate-900 dark:text-white">
          Đặt lại mật khẩu
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </div>
      </CardHeader>

      <CardContent className="pt-8 px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold">Mật khẩu mới</Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className={cn("pl-11 pr-11 h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary focus:ring-primary/20")}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-semibold">Xác nhận mật khẩu</Label>
            <div className="relative group">
              <CheckCircle2 className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="confirmPassword"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className={cn("pl-11 pr-11 h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-primary focus:ring-primary/20")}
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-primary transition-colors">
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-bold text-base rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2">Lưu mật khẩu mới <Save className="h-4 w-4" /></span>}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}