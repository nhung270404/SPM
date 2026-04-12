'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, Save, Eye, EyeOff, RefreshCcw,
  CheckCircle2, ShieldAlert, Briefcase, UserPlus, X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';

export function CreateUserView() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Styles đồng nhất với UserManagementView
  const glassCardClass = "bg-white/60 dark:bg-slate-950/40 backdrop-blur-3xl border-white/20 dark:border-white/5 shadow-2xl shadow-slate-200/20 dark:shadow-none transition-all duration-500";
  const glassInputClass = "h-11 bg-slate-100/50 dark:bg-slate-900/50 border-transparent focus:border-[#36caf1]/50 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm rounded-xl focus-visible:ring-[#36caf1]/20";

  return (
    <div className="flex flex-col h-full w-full space-y-8 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(54,202,241,0.06),transparent_50%)]">

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white shadow-sm transition-all group" asChild>
            <Link href="/control/user">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-[#36caf1] rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#36caf1]">Hành động quản trị</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Thêm nhân viên mới
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Thiết lập hồ sơ và cấp quyền truy cập hệ thống cho cộng tác viên mới.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button variant="ghost" className="flex-1 lg:flex-none h-11 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
            <Link href="/control/user">Hủy bỏ</Link>
          </Button>
          <Button className="flex-1 lg:flex-none h-11 px-8 rounded-xl bg-[#36caf1] hover:bg-[#03bdd8] text-white shadow-lg shadow-[#36caf1]/30 transition-all font-bold group">
            <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> 
            Lưu hồ sơ
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">

        {/* --- CỘT TRÁI: AVATAR & TRẠNG THÁI --- */}
        <div className="xl:col-span-1 space-y-8">
          <Card className={cn("overflow-hidden border-none", glassCardClass)}>
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#36caf1]" /> Ảnh đại diện
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8 p-8">
              <div className="relative group">
                <Avatar 
                  className="h-56 w-56 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-2xl cursor-pointer transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-1" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage src={avatarPreview || ""} className="object-cover" />
                  <AvatarFallback className="text-6xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 font-extralight text-slate-400">
                    <UserPlus className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>

                <div
                  className="absolute inset-0 bg-[#36caf1]/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-white p-4 rounded-full shadow-xl">
                    <Upload className="h-8 w-8 text-[#36caf1]" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-4 w-full">
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/20">
                   <p className="text-[11px] text-center text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                     Yêu cầu ảnh: Tối đa 5MB, JPG/PNG
                   </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-10 rounded-xl bg-white/50 dark:bg-slate-800 transition-all font-semibold text-xs" onClick={() => fileInputRef.current?.click()}>
                    Chọn ảnh
                  </Button>
                  {avatarPreview && (
                    <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-red-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setAvatarPreview(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("overflow-hidden border-none", glassCardClass)}>
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary"/> Bảo mật & Quyền hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Trạng thái kích hoạt</Label>
                  <p className="text-[11px] text-slate-500 font-medium">Cho phép đăng nhập ngay</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Xác thực 2FA</Label>
                  <p className="text-[11px] text-slate-500 font-medium">Bảo vệ tài khoản cao cấp</p>
                </div>
                <Switch className="data-[state=checked]:bg-[#36caf1]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- CỘT PHẢI: FORM THÔNG TIN --- */}
        <div className="xl:col-span-2 space-y-8">
          <Card className={cn("overflow-hidden border-none", glassCardClass)}>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Briefcase className="h-5 w-5"/></div>
                Thông tin hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-xs font-bold uppercase tracking-widest text-slate-500">Họ và tên <span className="text-red-500">*</span></Label>
                  <Input id="fullname" placeholder="Vũ Xuân Hải" className={glassInputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Địa chỉ Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" placeholder="haivx@smart-spm.vn" className={glassInputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-500">Số điện thoại</Label>
                  <Input id="phone" placeholder="0356 123 456" className={glassInputClass} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-widest text-slate-500">Ngày sinh</Label>
                  <Input id="dob" type="date" className={cn(glassInputClass, "block")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-slate-500">Địa chỉ thường trú</Label>
                  <Input id="address" placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" className={glassInputClass} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("overflow-hidden border-none", glassCardClass)}>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#36caf1]/10 text-[#36caf1]"><ShieldAlert className="h-5 w-5"/></div>
                Phân quyền & Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-6 space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phòng ban làm việc</Label>
                  <Select>
                    <SelectTrigger className={glassInputClass}>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      <SelectItem value="it" className="py-2.5">IT Department</SelectItem>
                      <SelectItem value="hr" className="py-2.5">Human Resources</SelectItem>
                      <SelectItem value="marketing" className="py-2.5">Marketing</SelectItem>
                      <SelectItem value="sales" className="py-2.5">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Chức vụ hệ thống</Label>
                  <Select defaultValue="staff">
                    <SelectTrigger className={glassInputClass}>
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                      <SelectItem value="admin" className="text-red-500 font-bold py-2.5">Quản trị viên (Admin)</SelectItem>
                      <SelectItem value="manager" className="text-blue-500 font-bold py-2.5">Quản lý (Manager)</SelectItem>
                      <SelectItem value="staff" className="py-2.5">Nhân viên (Staff)</SelectItem>
                      <SelectItem value="intern" className="py-2.5">Thực tập sinh (Intern)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#36caf1] mb-4 block">Thiết lập mật khẩu</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu khời tạo"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(glassInputClass, "pr-12")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-[#36caf1] hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={generatePassword} 
                    className="h-11 rounded-xl bg-white/50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 hover:bg-white font-bold text-xs px-6 transition-all"
                  >
                    <RefreshCcw className="h-3.5 w-3.5 mr-2 text-[#36caf1]" /> Tạo ngẫu nhiên
                  </Button>
                </div>
                {password && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mật khẩu đã sẵn sàng và được chấp nhận.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
