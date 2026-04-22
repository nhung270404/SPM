'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  const [members, setMembers] = useState<any[]>([]);

  // 1. Fetch current user to add as manager/first member
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
            isOwner: true
          }]);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng hiện tại:", error);
      }
    };
    if (open) fetchCurrentUser();
  }, [open]);

  // 2. Real-time User Search with Pagination
  const searchUsers = async (pageValue: number = 1) => {
    try {
      const res = await fetch(`/api/user/search?q=${newMemberName}&page=${pageValue}&limit=10`);
      const data = await res.json();
      setSearchResults(data.users || []);
      setPaginationData({
        total: data.total,
        totalPages: data.totalPages,
        page: data.page
      });
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => searchUsers(1), 300);
    return () => clearTimeout(debounce);
  }, [newMemberName, open]); // Re-search from page 1 when name or dialog opens

  const handleFocus = () => {
    if (searchResults.length === 0) {
      searchUsers(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationData?.totalPages || 1)) {
      searchUsers(newPage);
    }
  };

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
      ...user, 
      name: `${user.lastname} ${user.firstname}`.trim() || user.email 
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
    setSearchResults([]);
  };

  const removeMember = (id: string) => {
    if (members.find(m => m._id === id)?.isOwner) return toast.error("Không thể xóa người quản lý dự án");
    setMembers(members.filter(m => m._id !== id));
  };

  const handleSave = async () => {
    if (!projectName.trim()) return toast.error("Vui lòng nhập tên dự án");
    if (!projectKey.trim()) return toast.error("Vui lòng nhập mã Key");
    if (!description.trim()) return toast.error("Vui lòng nhập mô tả dự án");

    try {
      setIsLoading(true);
      
      const payload = {
        title: projectName,
        key: projectKey,
        description: description,
        members: members.map(m => m._id) // Send real IDs
      };

      await axios.post('/api/projects', payload);
      
      toast.success("Đã tạo dự án mới thành công!");
      onOpenChange(false);
      
      // Reset form
      setProjectName(''); 
      setProjectKey(''); 
      setDescription('');
      setMembers([]);
      
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
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                      Mô tả chi tiết <span className="text-red-500">*</span>
                    </Label>
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

                  <div className="flex gap-2 relative">
                    <div className="relative flex-1">
                      <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Thêm thành viên..."
                        className={cn(inputClass, "pl-9 h-10 text-sm")}
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onFocus={handleFocus}
                      />

                      {/* Search Results Dropdown */}
                      {searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="py-1 overflow-y-auto max-h-[250px] custom-scrollbar">
                            {searchResults.map((user) => (
                              <button
                                key={user._id}
                                onClick={() => handleAddMember(user)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-left"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/10 text-cyan-600 dark:text-cyan-400 text-[8px] font-bold uppercase">{user.lastname?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold truncate">{user.lastname} {user.firstname}</span>
                                  <span className="text-[10px] text-zinc-500 truncate">{user.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Pagination Controls */}
                          {paginationData && paginationData.totalPages > 1 && (
                            <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePageChange(currentPage - 1); }}
                                disabled={currentPage === 1}
                                className="h-7 px-2 text-[10px] gap-1 hover:bg-white dark:hover:bg-white/5"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                                Trước
                              </Button>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                Trang {currentPage} / {paginationData.totalPages}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePageChange(currentPage + 1); }}
                                disabled={currentPage === paginationData.totalPages}
                                className="h-7 px-2 text-[10px] gap-1 hover:bg-white dark:hover:bg-white/5"
                              >
                                Sau
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                            <TableRow key={m._id} className="border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 group h-12 transition-colors">
                              <TableCell className="py-1.5 pl-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-7 w-7 border border-zinc-200 dark:border-white/10">
                                    <AvatarImage src={m.avatar} />
                                    <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase">
                                      {m.name ? m.name.charAt(0).toUpperCase() : "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="overflow-hidden">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate leading-none">{m.name}</p>
                                      {m.isOwner && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-extrabold uppercase tracking-wider">Leader</span>}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 truncate leading-tight mt-1">{m.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="pr-2 text-right">
                                {!m.isOwner && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeMember(m._id)}
                                    className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-lg"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
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