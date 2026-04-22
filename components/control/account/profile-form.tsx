'use client';

import React from 'react';
import { User, Mail, Phone, Save, Loader2, Briefcase, Calendar, Clock, Camera, KeyRound, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/user-context';

export function ProfileForm() {
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [loadingPass, setLoadingPass] = React.useState(false);
  const [showPass, setShowPass] = React.useState({ current: false, new: false });
  const [passData, setPassData] = React.useState({ current: '', new: '' });
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const [form, setForm] = React.useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
  });

  React.useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname ?? '',
        lastname: user.lastname ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // 1. CẬP NHẬT THÔNG TIN CÁ NHÂN
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (avatarFile) formData.append('avatar', avatarFile);

      const profileRes = await fetch('/api/account', {
        method: 'PUT',
        body: formData,
      });

      const profileData = await profileRes.json();
      if (!profileData.success) throw new Error(profileData.message);

      // 2. CẬP NHẬT MẬT KHẨU (Nếu có nhập)
      if (passData.current && passData.new) {
        if (passData.new.length < 6) {
          throw new Error('Mật khẩu mới phải từ 6 ký tự');
        }

        const passRes = await fetch('/api/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: passData.current,
            newPassword: passData.new,
          }),
        });

        const passDataRes = await passRes.json();
        if (!passDataRes.success) throw new Error("Thông tin đã lưu, nhưng đổi mật khẩu thất bại: " + passDataRes.message);
        
        setPassData({ current: '', new: '' });
      }

      toast.success('Đã cập nhật thông tin tài khoản thành công!');
      await refreshUser();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Cập nhật thất bại';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy chữ cái đầu của tên
  const getInitials = () => {
    if (user?.firstname) {
      return user.firstname.charAt(0).toUpperCase();
    }
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return "?";
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar || "");

  React.useEffect(() => {
    if (user?.avatar) setAvatarUrl(user.avatar);
  }, [user?.avatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  // --- STYLE CLASSES ---
  const inputClass = cn(
    "h-12 pl-12 transition-all",
    "bg-white/60 dark:bg-[#1a1a1d]/60 border-zinc-200/60 dark:border-white/5 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl text-sm font-medium",
  );

  const iconClass = "absolute left-4 top-3.5 h-5 w-5 text-cyan-500/50";
  const labelClass = "text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block ml-1";

  return (
    <Card className="h-full flex flex-col border border-white/60 dark:border-white/5 shadow-2xl bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl transition-all rounded-[2.5rem] overflow-hidden">
      
      {/* IDENTITY SECTION */}
      <div className="p-8 pb-0 flex flex-col items-center md:items-start md:flex-row gap-8">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        
        <div className="relative group/avatar shrink-0">
          <div 
            className="h-28 w-28 rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white dark:border-[#121214] ring-1 ring-black/5 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-3xl font-black uppercase">
                {getInitials()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
               <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-cyan-500 text-white rounded-xl border-4 border-white dark:border-[#121214] shadow-lg cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left pt-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {user?.fullName || "Người dùng ZenWork"}
            </h1>
            <div className="px-2.5 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-cyan-500/20 w-fit mx-auto md:mx-0">
               Verified Account
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Hồ sơ cá nhân và nhận diện hệ thống của bạn.</p>
        </div>
      </div>

      {/* BODY CONTENT */}
      <CardContent className="p-8 flex-1 flex flex-col gap-10">
        
        {/* SECTION 1: PERSONAL INFO */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600">
               <User className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Thông tin cơ bản</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Họ</Label>
              <div className="relative"><User className={iconClass} /><Input value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})} className={inputClass} placeholder="Nguyễn" /></div>
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Tên</Label>
              <div className="relative"><User className={iconClass} /><Input value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})} className={inputClass} placeholder="Văn A" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Email</Label>
              <div className="relative"><Mail className={iconClass} /><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} /></div>
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Số điện thoại</Label>
              <div className="relative"><Phone className={iconClass} /><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} /></div>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-zinc-100 dark:bg-white/5" />

        {/* SECTION 2: SECURITY */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600">
               <KeyRound className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Bảo mật tài khoản</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={labelClass}>Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input type={showPass.current ? "text" : "password"} value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className={inputClass} placeholder="••••••••" />
                <button onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-4 top-3.5 text-zinc-400 hover:text-cyan-500" type="button">
                  {showPass.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Mật khẩu mới</Label>
              <div className="relative">
                <Input type={showPass.new ? "text" : "password"} value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className={inputClass} placeholder="••••••••" />
                <button onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-4 top-3.5 text-zinc-400 hover:text-cyan-500" type="button">
                  {showPass.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Nút THỐNG NHẤT */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-[0_10px_25px_-5px_rgba(6,182,212,0.4)] h-12 px-20 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 border-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Lưu hồ sơ cá nhân</>}
          </Button>
        </div>

        {/* FOOTER: System Info */}
        <div className="mt-4 pt-10 border-t border-zinc-100/50 dark:border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
               <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Briefcase className="h-3 w-3" /> Phòng ban</span>
               <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">IT Department</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="h-3 w-3" /> Ngày tham gia</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">24/12/2025</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Clock className="h-3 w-3" /> Hoạt động cuối</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Hôm nay, 09:30 AM</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}