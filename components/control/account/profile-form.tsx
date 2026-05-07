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
    if (user?.lastname) {
      return user.lastname.charAt(0).toUpperCase();
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
    "h-10 pl-10 transition-all",
    "bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-md text-sm",
  );

  const iconClass = "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 block ml-0.5";

  return (
    <div className="h-full flex flex-col">
      
      {/* IDENTITY SECTION */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        
        <div className="relative group/avatar shrink-0">
          <div 
            className="h-24 w-24 rounded-2xl overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold uppercase">
                {getInitials()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
               <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-lg border-2 border-background shadow-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-3 w-3" />
          </div>
        </div>

        <div className="flex-1 pt-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
            {user?.fullName || "Người dùng ZenWork"}
          </h1>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-1">Vai trò</span>
               <span className="text-sm font-bold text-foreground leading-none capitalize">
                 {user?.roles && user.roles.length > 0 ? user.roles.join(', ') : 'Thành viên'}
               </span>
            </div>

            <div className="w-[1px] h-8 bg-border hidden md:block" />

            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-1">Ngày gia nhập</span>
               <span className="text-sm font-bold text-foreground leading-none">
                 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '24/12/2025'}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex flex-col gap-6">
        
        {/* SECTION 1: PERSONAL INFO */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
               <User className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Thông tin cơ bản</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              <div className="relative">
                <Phone className={iconClass} />
                <Input 
                  value={form.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setForm({...form, phone: val});
                  }} 
                  className={inputClass} 
                  placeholder="09xxxxxxxx"
                />
              </div>
            </div>
          </div>
        </div>



        {/* SECTION 2: SECURITY */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
               <KeyRound className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Bảo mật tài khoản</h2>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className={labelClass}>Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input type={showPass.current ? "text" : "password"} value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className={inputClass} placeholder="••••••••" />
                  <button onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary" type="button">
                    {showPass.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Mật khẩu mới</Label>
                <div className="relative">
                  <Input type={showPass.new ? "text" : "password"} value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className={inputClass} placeholder="••••••••" />
                  <button onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary" type="button">
                    {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Nút THỐNG NHẤT */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-10 rounded-lg font-bold text-sm transition-all shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Cập nhật hồ sơ</>}
          </Button>
        </div>
      </div>
    </div>
  );
}