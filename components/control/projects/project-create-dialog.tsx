'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase, Users, Plus, Trash2, KeyRound, UserPlus, Save, Loader2, X, ShieldCheck, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  _id: string;
  name: string;
  email: string;
  avatar: string;
  isLeader?: boolean;
};

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProjectCreateDialog({ open, onOpenChange, onSuccess }: ProjectCreateDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [description, setDescription] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Trạng thái focus của ô tìm kiếm
  const [members, setMembers] = useState<Member[]>([]);

  // 1. Khởi tạo danh sách thành viên (Mặc định thêm Admin)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/account');
        const json = await res.json();
        if (json.success) {
          const u = json.data;
          setMembers([{
            _id: u._id,
            name: `${u.lastname} ${u.firstname}`.trim() || u.email,
            email: u.email,
            avatar: u.avatar || '',
            isLeader: true 
          }]);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng hiện tại:", error);
      }
    };
    if (open) fetchCurrentUser();
  }, [open]);

  // 2. Tìm kiếm nhân sự
  const searchUsers = async () => {
    try {
      // Tìm kiếm ngay cả khi chuỗi rỗng để hiển thị gợi ý khi focus
      const res = await fetch(`/api/user/search?q=${newMemberName}&limit=10`);
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
        if (open) searchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [newMemberName, open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProjectName(val);
    const autoKey = val.split(' ').map(w => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!projectKey || projectKey.length < autoKey.length) {
      setProjectKey(autoKey);
    }
  };

  const handleAddMember = (user: any) => {
    if (members.find((m: any) => m._id === user._id)) return toast.warning("Đã có trong danh sách");
    const newMember = { 
      _id: user._id, 
      name: `${user.lastname} ${user.firstname}`.trim() || user.email,
      email: user.email,
      avatar: user.avatar || '',
      isLeader: members.length === 0 
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
    setIsSearchFocused(false); // Ẩn danh sách sau khi chọn
  };

  const removeMember = (id: string) => {
    const memberToRemove = members.find(m => m._id === id);
    if (memberToRemove?.isLeader && members.length > 1) {
        return toast.error("Vui lòng chỉ định Leader mới trước khi xóa Leader hiện tại");
    }
    setMembers(members.filter(m => m._id !== id));
  };

  const setAsLeader = (id: string) => {
    setMembers(members.map(m => ({ ...m, isLeader: m._id === id })));
    toast.success(`Đã chỉ định Leader mới`);
  };

  const handleSave = async () => {
    if (!projectName.trim()) return toast.error("Vui lòng nhập tên dự án");
    if (!projectKey.trim()) return toast.error("Vui lòng nhập mã Key");
    
    const leader = members.find(m => m.isLeader);
    if (!leader) return toast.error("Vui lòng chỉ định một Leader cho dự án");

    try {
      setIsLoading(true);
      const payload = {
        title: projectName,
        key: projectKey,
        description: description,
        manager: leader._id,
        members: members.map(m => m._id)
      };
      await axios.post('/api/projects', payload);
      toast.success("Đã tạo dự án mới và bàn giao quyền Leader!");
      onOpenChange(false);
      setProjectName(''); setProjectKey(''); setDescription(''); setMembers([]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Không thể tạo dự án");
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc kết quả tìm kiếm (ẩn những người đã có trong dự án)
  const filteredResults = searchResults.filter(u => !members.some(m => m._id === u._id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1100px] w-[95vw] h-auto max-h-[90vh] p-0 flex flex-col gap-0 outline-none overflow-hidden rounded-xl bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 [&>button]:hidden">

        {/* HEADER */}
        <DialogHeader className="p-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shrink-0 flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">Khởi tạo Dự án</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
              Thiết lập thông tin dự án và chỉ định người chịu trách nhiệm chính (Leader).
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 p-6 pt-4 overflow-y-auto">
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* THÔNG TIN CHUNG */}
            <div className="lg:col-span-7">
              <Card className="h-full shadow-sm rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 py-3 px-5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-cyan-500" /> Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5 px-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Tên dự án *</Label>
                      <Input placeholder="Tên dự án..." className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-all rounded-xl h-10" value={projectName} onChange={handleNameChange} />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Mã Key *</Label>
                      <Input placeholder="KEY" className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-all rounded-xl h-10 font-mono text-center uppercase" value={projectKey} onChange={(e) => setProjectKey(e.target.value.toUpperCase())} maxLength={6} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Mô tả dự án</Label>
                    <Textarea placeholder="Mô tả mục tiêu dự án..." className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-all rounded-xl min-h-[120px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* THÀNH VIÊN & LEADER */}
            <div className="lg:col-span-5">
              <Card className="h-full shadow-sm rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex flex-col">
                <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 py-3 px-5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-500" /> Quản lý nhân sự ({members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 pt-4 px-4 pb-4">
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Tìm và thêm thành viên..."
                      className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-all rounded-xl pl-9 h-10"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay để kịp click chọn
                    />
                    
                    {/* CHỈ HIỂN THỊ KHI ĐANG FOCUS VÀ CÓ KẾT QUẢ */}
                    {isSearchFocused && filteredResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="py-1 max-h-[200px] overflow-y-auto">
                          {filteredResults.map((user) => (
                            <button key={user._id} onClick={() => handleAddMember(user)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-[10px]">{user.lastname?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold truncate">{user.lastname} {user.firstname}</span>
                                <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/40 dark:bg-black/20 min-h-[200px]">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableBody>
                          {members.map((m) => (
                            <TableRow key={m._id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 group">
                              <TableCell className="py-2 pl-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-800">
                                    <AvatarImage src={m.avatar} />
                                    <AvatarFallback className="text-[10px] font-bold">{m.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold flex items-center gap-1.5 truncate">
                                      {m.name}
                                      {m.isLeader && <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />}
                                    </span>
                                    <span className="text-[9px] text-slate-500 truncate">{m.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="pr-2 text-right space-x-1">
                                {!m.isLeader ? (
                                  <Button variant="ghost" size="icon" onClick={() => setAsLeader(m._id)} title="Chỉ định làm Leader" className="h-8 w-8 text-slate-400 hover:text-amber-500">
                                    <ShieldCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-none text-[8px] font-extrabold uppercase">Leader</Badge>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => removeMember(m._id)} className="h-8 w-8 text-slate-400 hover:text-red-500">
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
        <div className="p-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-10 px-6 font-bold text-slate-500">Hủy bỏ</Button>
          <Button onClick={handleSave} disabled={isLoading} className="h-11 px-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Lưu & Bàn giao</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}