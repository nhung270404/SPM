'use client';

import React from 'react';
import { 
  User, Mail, Phone, Save, Loader2, Briefcase, 
  Calendar, Camera, KeyRound, Eye, EyeOff, 
  ShieldCheck, MapPin, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/user-context';

export function ProfileForm() {
  const { user, refreshUser } = useUser();
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [loadingPass, setLoadingPass] = React.useState(false);
  const [showPass, setShowPass] = React.useState({ current: false, new: false });
  const [passData, setPassData] = React.useState({ current: '', new: '' });
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const [form, setForm] = React.useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  });

  React.useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname ?? '',
        lastname: user.lastname ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoadingProfile(true);
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

      toast.success('Đã cập nhật hồ sơ thành công!');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passData.current || !passData.new) {
        throw new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại và mới');
      }
      if (passData.new.length < 6) {
        throw new Error('Mật khẩu mới phải từ 6 ký tự');
      }

      setLoadingPass(true);
      const passRes = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passData.current,
          newPassword: passData.new,
        }),
      });

      const passDataRes = await passRes.json();
      if (!passDataRes.success) throw new Error(passDataRes.message);
      
      setPassData({ current: '', new: '' });
      toast.success('Đã đổi mật khẩu thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoadingPass(false);
    }
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

  const getRoleDisplay = () => {
    if (!user?.roles || user.roles.length === 0) return 'Thành viên';
    return user.roles.map((r: any) => typeof r === 'object' ? (r.title || r.name) : r).join(', ');
  };

  const getInitials = () => {
    return (user?.lastname?.charAt(0) || user?.firstname?.charAt(0) || "?").toUpperCase();
  };

  const inputClass = cn(
    "pl-11 h-12 bg-white/50 dark:bg-black/20 backdrop-blur-md border-slate-200/60 dark:border-white/5",
    "text-slate-900 dark:text-white placeholder:text-slate-400 text-sm rounded-2xl",
    "focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-none"
  );

  const cardClass = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all duration-300";

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-2">
      
      {/* IDENTITY HEADER */}
      <div className={cn(cardClass, "relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(54,202,241,0.15)]")}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <div className="h-28 w-28 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative transition-transform duration-500 group-hover/avatar:scale-105">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-4xl font-black uppercase">
                            {getInitials()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Camera className="h-7 w-7 text-white animate-pulse" />
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 h-9 w-9 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-50 dark:border-slate-600 text-cyan-500">
                    <Camera className="h-4.5 w-4.5" />
                </div>
            </div>

            <div className="flex-1 space-y-5">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                        {user?.fullName || "Người dùng ZenWork"}
                    </h1>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <BadgeCheck className="h-4.5 w-4.5 text-cyan-500" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tài khoản chính thức</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-10 gap-y-4 pt-2">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500 shadow-inner">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Vai trò</p>
                            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 leading-none">{getRoleDisplay()}</p>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500 shadow-inner">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Gia nhập</p>
                            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 leading-none">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
        {/* PERSONAL INFO */}
        <div className={cardClass}>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shadow-sm shadow-cyan-500/10">
                    <User className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Thông tin cá nhân</h2>
            </div>

            <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Họ</Label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                            <Input value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})} className={inputClass} placeholder="Họ" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tên</Label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                            <Input value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})} className={inputClass} placeholder="Tên" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email liên hệ</Label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} placeholder="example@mail.com" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</Label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9]/g, '')})} className={inputClass} placeholder="09xxxxxxxx" />
                    </div>
                </div>
            </div>

            <Button 
                onClick={handleUpdateProfile} 
                disabled={loadingProfile} 
                className="mt-10 w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/30 border-0 transition-all active:scale-[0.98]"
            >
                {loadingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> Lưu thông tin cá nhân</>}
            </Button>
        </div>

        {/* SECURITY */}
        <div className={cardClass}>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-sm shadow-amber-500/10">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Bảo mật hệ thống</h2>
            </div>

            <div className="space-y-6 flex-1">
                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</Label>
                    <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <Input type={showPass.current ? "text" : "password"} value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className={inputClass} placeholder="••••••••" />
                        <button onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors" type="button">
                            {showPass.current ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</Label>
                    <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <Input type={showPass.new ? "text" : "password"} value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className={inputClass} placeholder="••••••••" />
                        <button onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors" type="button">
                            {showPass.new ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-1 italic">
                        * Mật khẩu mới cần ít nhất 6 ký tự bao gồm chữ và số.
                    </p>
                </div>
            </div>

            <Button 
                onClick={handleChangePassword} 
                disabled={loadingPass} 
                className="mt-10 w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/30 border-0 transition-all active:scale-[0.98]"
            >
                {loadingPass ? <Loader2 className="h-5 w-5 animate-spin" /> : <><KeyRound className="h-5 w-5 mr-2" /> Xác nhận đổi mật khẩu</>}
            </Button>
        </div>
      </div>
    </div>
  );
}