'use client';

import React, { useState } from 'react';
import {
  Briefcase, Users, Plus, Trash2, KeyRound, UserPlus, Save, Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

export type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Update type to match usage if needed
}

export function ProjectCreateDialog({ open, onOpenChange, onSuccess }: ProjectCreateDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [description, setDescription] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Nguyễn Văn A', email: 'vana@batek.vn', avatar: 'https://github.com/shadcn.png' },
  ]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProjectName(val);
    const autoKey = val.split(' ').map(w => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!projectKey || projectKey.length < autoKey.length) {
      setProjectKey(autoKey);
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: Member = {
      id: Math.random().toString(),
      name: newMemberName,
      email: `${newMemberName.toLowerCase().replace(/\s/g, '')}@batek.vn`,
      avatar: '',
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
  };

  const handleSave = async () => {
    if (!projectName.trim()) return toast.error("Vui lòng nhập tên dự án");
    if (!projectKey.trim()) return toast.error("Vui lòng nhập mã Key");

    try {
      setIsLoading(true);
      
      const payload = {
        title: projectName,
        key: projectKey,
        description: description
      };

      await axios.post('/api/projects', payload);
      
      toast.success("Đã tạo dự án mới thành công!");
      onOpenChange(false);
      
      // Reset form
      setProjectName(''); 
      setProjectKey(''); 
      setDescription('');
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Lỗi tạo dự án:", error);
      const errorMsg = error.response?.data?.error || "Không thể tạo dự án, vui lòng thử lại";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLE CLASSES THÔNG MINH (Light/Dark) ---

  // Input: Nền trắng/đen, viền 2px, Focus màu Cam
  const inputClass = cn(
    "bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm",
    "border border-slate-200 dark:border-slate-800",
    "text-slate-900 dark:text-white",
    "placeholder:text-slate-400",
    "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200 rounded-xl"
  );

  // Card: Nền xám nhạt/đen than, viền mảnh
  const cardClass = cn(
    "h-full shadow-sm rounded-2xl overflow-hidden",
    "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md",
    "border border-slate-200 dark:border-slate-800"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1100px] w-[95vw] h-auto max-h-[90vh] p-0 flex flex-col gap-0 outline-none overflow-hidden rounded-xl bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 [&>button]:hidden">

        {/* HEADER */}
        <DialogHeader className="p-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shrink-0 flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Dự án mới</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
              Khởi tạo không gian làm việc mới cho đội nhóm của bạn.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/10 rounded-full h-9 w-9">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 bg-white dark:bg-[#0a0a0a] p-6 pt-4 overflow-y-auto">
          <div className="grid gap-6 lg:grid-cols-12 h-full">

            {/* CỘT TRÁI: Thông tin chung */}
            <div className="lg:col-span-8 h-full">
              <Card className={cardClass}>
                <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 py-3 px-5">
                  <CardTitle className="flex items-center gap-2 text-base text-zinc-900 dark:text-white">
                    <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    Thông tin chung
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5 pt-5 px-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-8 space-y-2">
                      <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                        Tên dự án <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Nhập tên dự án..."
                        className={cn(inputClass, "h-10 text-sm px-3")}
                        value={projectName}
                        onChange={handleNameChange}
                      />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <KeyRound className="h-3 w-3 text-primary" /> Mã Key
                      </Label>
                      <Input
                        placeholder="KEY"
                        className={cn(inputClass, "h-10 text-sm font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 uppercase tracking-widest")}
                        value={projectKey}
                        onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Mô tả chi tiết</Label>
                    <Textarea
                      placeholder="Mô tả mục tiêu, phạm vi dự án..."
                      className={cn(inputClass, "min-h-[140px] resize-none text-sm p-3 leading-relaxed")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI: Thành viên */}
            <div className="lg:col-span-4 h-full">
              <Card className={cn(cardClass, "flex flex-col")}>
                <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 py-3 px-5">
                  <CardTitle className="flex items-center gap-2 text-base text-zinc-900 dark:text-white">
                    <div className="p-1.5 rounded-md bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      <Users className="h-4 w-4" />
                    </div>
                    Thành viên <span className="text-zinc-400 dark:text-zinc-500 text-xs ml-auto font-normal">({members.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 pt-4 px-4 pb-4 overflow-hidden">

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Thêm thành viên..."
                        className={cn(inputClass, "pl-9 h-10 text-sm")}
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                      />
                    </div>
                    <Button size="icon" onClick={handleAddMember} className="shrink-0 h-10 w-10 bg-green-600 hover:bg-green-500 text-white border-0 shadow-md shadow-green-500/20">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden relative min-h-[150px]">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableHeader className="bg-zinc-100 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                          <TableRow className="border-zinc-200 dark:border-white/5 hover:bg-transparent h-8">
                            <TableHead className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold pl-3 h-8">Thành viên</TableHead>
                            <TableHead className="w-8 h-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((m) => (
                            <TableRow key={m.id} className="border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 group h-12 transition-colors">
                              <TableCell className="py-1.5 pl-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-7 w-7 border border-zinc-200 dark:border-white/10">
                                    <AvatarImage src={m.avatar} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px] font-bold">
                                      {m.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="overflow-hidden">
                                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate leading-none">{m.name}</p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 truncate leading-tight mt-1">{m.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="pr-1 text-right">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 text-sm font-medium"
          >
            Hủy bỏ
          </Button>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="h-11 px-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/20 font-bold text-sm border-0 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Lưu Dự Án</>}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}