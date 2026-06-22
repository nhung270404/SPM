'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Settings2, Users, Trash2,
  Save, Loader2, Camera, Search, UserPlus, AlertTriangle,
  ChevronLeft, ChevronRight, Plus, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const MOCK_SYSTEM_USERS = [
  { _id: 'u1', firstname: 'Nguyễn', lastname: 'Văn A', email: 'vana@batek.vn', avatar: '' },
  { _id: 'u2', firstname: 'Trần', lastname: 'Thị B', email: 'thib@batek.vn', avatar: '' },
  { _id: 'u3', firstname: 'Lê', lastname: 'Hoàng C', email: 'hoangc@batek.vn', avatar: '' },
  { _id: 'u4', firstname: 'Phạm', lastname: 'Minh D', email: 'minhd@batek.vn', avatar: '' },
  { _id: 'u5', firstname: 'Hoàng', lastname: 'Thùy E', email: 'thuye@batek.vn', avatar: '' },
];

export function ProjectSettingsView({ projectId }: { projectId: string }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);

  // State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Real Project Data
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Không thể tải thông tin dự án");
        const data = await res.json();
        
        // Transform members for UI if needed
        if (data) {
          data.members = data.members.map((m: any) => ({
            ...m,
            name: `${m.lastname} ${m.firstname}`.trim() || m.email
          }));
        }
        
        setProject(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // 2. Real-time User Search with Pagination
  const searchUsers = async (pageValue: number = 1) => {
    try {
      const res = await fetch(`/api/user/search?q=${searchTerm}&page=${pageValue}&limit=50`);
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
    const debounce = setTimeout(() => {
      searchUsers(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationData?.totalPages || 1)) {
      searchUsers(newPage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to S3/Cloudinary here.
      // For now, we'll use base64 or a fake URL to demonstrate persistence of the field.
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'cover') setProject({ ...project, coverImage: base64String });
        else setProject({ ...project, avatar: base64String });
      };
      reader.readAsDataURL(file);
      toast.success(`Đã chọn ảnh ${type === 'cover' ? 'bìa' : 'đại diện'} mới`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare payload: map members back to ObjectIDs
      const payload = {
        ...project,
        members: project.members.map((m: any) => m._id)
      };

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");
      
      toast.success("Đã cập nhật dự án thành công!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setSaving(true);
    try {
      const updatedMembersIds = project.members
        .filter((m: any) => m._id !== memberToDelete._id)
        .map((m: any) => m._id);

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembersIds }),
      });

      if (!res.ok) throw new Error("Không thể xóa thành viên");

      setProject({ 
        ...project, 
        members: project.members.filter((m: any) => m._id !== memberToDelete._id) 
      });
      toast.success(`Đã xóa ${memberToDelete.name} khỏi dự án`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
      setMemberToDelete(null);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Xóa dự án thất bại");
      
      toast.success("Đã xóa dự án vĩnh viễn");
      setDeleteProjectOpen(false);
      router.push('/control/projects');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddMember = async (user: any) => {
    if (project.members.find((m: any) => m._id === user._id)) {
      return toast.warning("Nhân sự này đã có trong dự án");
    }

    setSaving(true);
    try {
      const updatedMembersIds = [...project.members.map((m: any) => m._id), user._id];

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembersIds }),
      });

      if (!res.ok) throw new Error("Không thể thêm thành viên");

      const newMember = { 
        ...user, 
        name: `${user.lastname} ${user.firstname}`.trim() || user.email 
      };
      
      setProject({ 
        ...project, 
        members: [...project.members, newMember] 
      });
      
      toast.success(`Đã thêm ${newMember.name} vào dự án`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const availableUsers = searchResults.filter(u => !project?.members?.some((m: any) => m._id === u._id));

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] w-full bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white relative overflow-hidden">

      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />

      {/* HEADER - Sleek minimalist style */}
      <div className="flex-none flex items-center h-16 px-6 border-b border-zinc-200/60 dark:border-white/5 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl z-20 justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => router.back()} 
            className="h-10 w-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white border border-cyan-100 dark:border-cyan-500/20 shadow-sm transition-all hover:scale-110 active:scale-95 group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" /> 
          </Button>
          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-100/50 dark:bg-cyan-500/10 border border-cyan-200/50 dark:border-cyan-500/20 shadow-inner">
              <Settings2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">Cài đặt hệ thống</h1>
          </div>
        </div>
      </div>

      {/* BODY CONTAINER */}
      <div className="flex flex-1 overflow-hidden z-10 min-h-0">

        {/* SIDEBAR */}
        <div className="flex-none w-64 border-r border-zinc-200/60 dark:border-white/5 p-4 flex flex-col bg-white dark:bg-[#0c0c0c] h-full space-y-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 mb-3">Tùy chọn</p>
            <button 
              onClick={() => setActiveTab('general')} 
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 border-2", 
                activeTab === 'general' 
                  ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20 shadow-sm" 
                  : "text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"
              )}
            >
              <Settings2 className={cn("h-4 w-4", activeTab === 'general' ? "text-cyan-600" : "")} /> Chung
            </button>
            <button 
              onClick={() => setActiveTab('members')} 
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 border-2", 
                activeTab === 'members' 
                  ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20 shadow-sm" 
                  : "text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"
              )}
            >
              <Users className={cn("h-4 w-4", activeTab === 'members' ? "text-cyan-600" : "")} /> Thành viên
            </button>
          </div>
          
          <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-white/5">
            <div className="bg-zinc-50/50 dark:bg-white/[0.03] p-4 rounded-2xl border border-zinc-200/50 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trạng thái</span>
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Hoạt động</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 scroll-smooth min-h-0 bg-zinc-50 dark:bg-[#0a0a0a]">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : (
            <>
              {/* --- TAB: GENERAL --- */}
              {activeTab === 'general' && (
                <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">

                  {/* 1. HERO CARD */}
                  <div className="w-full rounded-3xl border border-zinc-200/60 dark:border-white/[0.06] shadow-xl bg-white dark:bg-[#0d1117] overflow-hidden group">

                    {/* === BANNER === */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-[#060d1a] dark:to-[#0a1526]">
                      {/* Animated mesh gradient blobs */}
                      <div className="absolute -top-8 -left-8 h-64 w-64 rounded-full bg-cyan-400/20 dark:bg-cyan-500/25 blur-3xl animate-pulse" style={{animationDuration:'4s'}}/>
                      <div className="absolute -top-4 right-0 h-72 w-72 rounded-full bg-blue-400/20 dark:bg-blue-600/25 blur-3xl animate-pulse" style={{animationDuration:'6s', animationDelay:'1s'}}/>
                      <div className="absolute bottom-0 left-1/3 h-48 w-72 rounded-full bg-indigo-400/15 dark:bg-indigo-600/20 blur-2xl animate-pulse" style={{animationDuration:'5s', animationDelay:'2s'}}/>
                      
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]" style={{backgroundImage:'linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)', backgroundSize:'28px 28px'}} />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-[#060d1a]/80 to-transparent" />

                      {project?.coverImage && (
                        <img src={project.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-50 group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                      )}

                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute bottom-3 right-3 z-20 bg-white/50 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/60 backdrop-blur-md text-zinc-800 dark:text-white/80 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                      >
                        <Camera className="h-3 w-3" /> Thay ảnh bìa
                      </button>
                    </div>

                    {/* === INFO ROW: Avatar bên trái banner, không float === */}
                    <div className="flex items-center gap-5 px-6 py-5">
                      {/* Avatar */}
                      <div
                        className="relative flex-none h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-50 dark:from-cyan-950 dark:to-blue-900 flex items-center justify-center shadow-lg border-2 border-white dark:border-white/[0.08] group/avatar cursor-pointer overflow-hidden"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {project?.avatar
                          ? <img src={project.avatar} className="w-full h-full object-cover" alt="Avatar"/>
                          : <Layers className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                        }
                        <div className="absolute inset-0 bg-cyan-600/75 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-200">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* Title + key + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20 text-[9px] font-bold tracking-widest uppercase px-2 h-5 rounded-md">
                            DỰ ÁN
                          </Badge>
                          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">{project?.key}</span>
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-tight truncate">
                          {project?.title || 'Dự án mới'}
                        </h2>
                        {project?.description && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{project.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. FORM SECTION */}
                  <div className="space-y-5 bg-white dark:bg-white/[0.02] p-7 rounded-3xl border border-zinc-200/70 dark:border-white/[0.06] shadow-sm">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-cyan-500" /> Tên dự án <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={project?.title || ''}
                        onChange={(e) => setProject({...project, title: e.target.value})}
                        className="h-11 bg-zinc-50 dark:bg-[#121214] border-zinc-200 dark:border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 rounded-xl text-sm font-medium transition-all"
                        placeholder="Ví dụ: Hệ thống quản lý SP..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-blue-500" /> Mô tả ngắn gọn
                      </label>
                      <Textarea
                        className="min-h-[110px] bg-zinc-50 dark:bg-[#121214] border-zinc-200 dark:border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 rounded-xl resize-none text-sm font-medium leading-relaxed transition-all"
                        value={project?.description || ''}
                        onChange={(e) => setProject({...project, description: e.target.value})}
                        placeholder="Viết vài dòng giới thiệu về mục tiêu dự án này..."
                      />
                    </div>

                    <div className="pt-5 flex items-center justify-between border-t border-zinc-100 dark:border-white/5">
                      <Button
                        onClick={() => setDeleteProjectOpen(true)}
                        variant="ghost"
                        className="h-10 px-5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-wider transition-all gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa dự án
                      </Button>

                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white h-10 px-7 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 gap-2 text-[10px] font-bold uppercase tracking-wider border-0"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Cập nhật
                      </Button>
                    </div>
                  </div>

                </div>
              )}

              {/* --- TAB: MEMBERS --- */}
              {activeTab === 'members' && (
                <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Team Management</span>
                      </div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Quản lý thành viên</h2>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Phân quyền và điều phối nhân sự trong dự án.</p>
                    </div>
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/25 transition-all px-6 font-bold rounded-2xl h-11 text-[10px] uppercase tracking-wider gap-2 border-0">
                          <UserPlus className="h-4 w-4" /> THÊM NHÂN SỰ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md">
                        <DialogHeader><DialogTitle>Mời thành viên</DialogTitle><DialogDescription className="text-zinc-500 dark:text-zinc-400">Thêm nhân sự vào <strong>{project?.title}</strong>.</DialogDescription></DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" /><Input placeholder="Tìm kiếm..." className="pl-9 bg-zinc-50 dark:bg-[#1a1a1d] border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableUsers.length > 0 ? availableUsers.map((user) => (
                              <div key={user._id} className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-[#1a1a1d] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700"><AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold">{user.lastname?.charAt(0).toUpperCase() || "?"}</AvatarFallback></Avatar>
                                  <div className="flex flex-col"><span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{user.lastname} {user.firstname}</span><span className="text-[10px] text-zinc-500">{user.email}</span></div>
                                </div>
                                <Button 
                                  size="sm" 
                                  disabled={saving}
                                  className="h-8 px-4 bg-white dark:bg-[#27272a] hover:bg-cyan-500 hover:text-white text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all shadow-sm text-[9px] font-bold uppercase tracking-wider" 
                                  onClick={() => handleAddMember(user)}
                                >
                                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Thêm"}
                                </Button>
                              </div>
                            )) : <div className="text-center py-4 text-zinc-500 text-xs">Không tìm thấy.</div>}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Table: Standard Modern Look */}
                  <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-zinc-50/50 dark:bg-white/[0.03] text-[10px] text-zinc-500 uppercase font-bold tracking-wider border-b border-zinc-200/60 dark:border-white/5">
                          <th className="px-6 py-4 text-left">Nhân sự</th>
                          <th className="px-6 py-4 text-left">Vai trò</th>
                          <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100/50 dark:divide-white/5">
                      {project?.members?.map((member: any, i: number) => (
                        <tr key={i} className="group hover:bg-cyan-50/30 dark:hover:bg-cyan-500/5 transition-all duration-300">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm transition-transform group-hover:scale-105">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/30 text-[13px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                                  {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{member.name}</span>
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">{member.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {member._id === project?.manager?._id ? (
                              <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-0 text-[10px] font-black tracking-widest h-6 px-3 rounded-lg shadow-none">LEADER</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-0 text-[9px] font-bold tracking-wider h-6 px-3 rounded-lg">MEMBER</Badge>
                            )}
                          </td>
                           <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-300" onClick={() => setMemberToDelete(member)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent className="bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-zinc-200/60 dark:border-white/5 text-zinc-900 dark:text-white rounded-[2rem] shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-500 uppercase font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Bạn có chắc chắn muốn xóa <span className="font-bold text-zinc-900 dark:text-white">{memberToDelete?.name}</span> khỏi dự án này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="h-11 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/5 border-0 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-2xl transition-all">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMember} className="h-11 text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white border-0 rounded-2xl shadow-lg shadow-red-500/20 transition-all">Đồng ý xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent className="bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border border-red-100 dark:border-red-900/20 text-zinc-900 dark:text-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.2)] max-w-md">
          <AlertDialogHeader>
            <div className="h-14 w-14 rounded-[1.5rem] bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4 mx-auto border border-red-100 dark:border-red-900/30">
              <Trash2 className="h-7 w-7 text-red-600 dark:text-red-500" />
            </div>
            <AlertDialogTitle className="text-red-600 dark:text-red-500 uppercase font-bold text-center text-lg tracking-tight">Xóa vĩnh viễn dự án</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs text-center leading-relaxed">
              Hành động này không thể hoàn tác. Mọi dữ liệu về <strong className="text-zinc-900 dark:text-white font-bold">{project?.title}</strong> sẽ bị xóa sạch khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-12 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/5 border-0 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-2xl transition-all">Hủy, tôi sẽ giữ lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="flex-1 h-12 text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white border-0 rounded-2xl shadow-xl shadow-red-500/20 transition-all">Tôi hiểu, hãy xóa nó</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}