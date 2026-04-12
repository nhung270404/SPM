'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Settings2, Users, Trash2,
  Save, Loader2, Camera, Search, UserPlus, AlertTriangle
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

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 1. Mock Data Loading
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setTimeout(() => {
        setProject({
          _id: projectId,
          title: "Website Bán Hàng 2026",
          description: "Dự án phát triển nền tảng thương mại điện tử thế hệ mới.",
          key: "WEB-2026",
          coverImage: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8",
          avatar: "",
          status: "active",
          members: [
            { _id: 'u1', name: 'Nguyễn Văn A', email: 'vana@batek.vn', avatar: '' },
            { _id: 'u2', name: 'Trần Thị B', email: 'thib@batek.vn', avatar: '' },
          ]
        });
        setLoading(false);
      }, 500);
    };
    fetchProject();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'cover') setProject({ ...project, coverImage: previewUrl });
      else setProject({ ...project, avatar: previewUrl });
      toast.success(`Đã chọn ảnh ${type === 'cover' ? 'bìa' : 'đại diện'} mới`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Đã cập nhật thành công!");
    }, 1000);
  };

  const confirmDeleteMember = () => {
    const updatedMembers = project.members.filter((m: any) => m._id !== memberToDelete._id);
    setProject({ ...project, members: updatedMembers });
    toast.success(`Đã xóa ${memberToDelete.name}`);
    setMemberToDelete(null);
  };

  const handleDeleteProject = () => {
    toast.success("Đã xóa dự án");
    setDeleteProjectOpen(false);
    router.push('/control/projects');
  };

  const handleAddMember = (user: any) => {
    if (project.members.find((m: any) => m._id === user._id)) return toast.warning("Đã có trong dự án");
    const newMember = { _id: user._id, name: `${user.lastname} ${user.firstname}`, avatar: user.avatar, email: user.email };
    setProject({ ...project, members: [...project.members, newMember] });
    toast.success("Đã thêm thành viên");
  };

  const availableUsers = MOCK_SYSTEM_USERS.filter(u => !project?.members?.some((m: any) => m._id === u._id));

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white relative overflow-hidden">

      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />

      {/* HEADER - Solid */}
      <div className="flex-none flex items-center h-12 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] z-20 justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 h-8 px-2">
            <ArrowLeft className="h-4 w-4" /> <span className="text-xs font-medium">Quay lại</span>
          </Button>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-3" />
          <h1 className="text-xs font-bold tracking-[0.1em] text-orange-600 dark:text-orange-500 uppercase">Cài đặt</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white h-7 px-3 rounded shadow-sm gap-2 text-[10px] font-bold uppercase tracking-wide border-0">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} LƯU
        </Button>
      </div>

      {/* BODY CONTAINER */}
      <div className="flex flex-1 overflow-hidden z-10">

        {/* SIDEBAR */}
        <div className="flex-none w-56 border-r border-zinc-200 dark:border-zinc-800 p-3 flex flex-col bg-white dark:bg-[#0c0c0c] h-full">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-2 mt-1">Menu</p>
            <button onClick={() => setActiveTab('general')} className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all", activeTab === 'general' ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200")}>
              <Settings2 className="h-3.5 w-3.5" /> Chung
            </button>
            <button onClick={() => setActiveTab('members')} className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all", activeTab === 'members' ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200")}>
              <Users className="h-3.5 w-3.5" /> Thành viên
            </button>
          </div>
          <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-[#151515] p-2 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Trạng thái</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 scroll-smooth min-h-0 bg-zinc-50 dark:bg-[#0a0a0a]">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {/* --- TAB: GENERAL (NO-FRAME STYLE) --- */}
              {activeTab === 'general' && (
                <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">

                  {/* 1. COVER IMAGE: Độc lập, không card */}
                  <div className="relative w-full rounded-xl overflow-hidden group shadow-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 h-40">
                    <div className="absolute inset-0 bg-black/10 dark:bg-black/40 z-10 pointer-events-none" />
                    {project?.coverImage && (
                      <img src={project.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    )}
                    <button onClick={() => coverInputRef.current?.click()} className="absolute top-3 right-3 z-30 bg-white/90 dark:bg-black/80 hover:bg-white text-zinc-900 dark:text-white p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm flex items-center gap-1.5 text-[10px] font-bold">
                      <Camera className="h-3.5 w-3.5" /> Thay ảnh bìa
                    </button>
                  </div>

                  {/* 2. INFO & FORM: Nằm trực tiếp trên background */}
                  <div className="px-1">

                    {/* Header Info */}
                    <div className="flex items-end gap-5 mb-8 relative -mt-16 z-20 px-4">
                      <div className="relative h-20 w-20 rounded-2xl bg-white dark:bg-[#121214] flex items-center justify-center shadow-lg border border-zinc-200 dark:border-zinc-800 group/avatar cursor-pointer overflow-hidden ring-4 ring-zinc-50 dark:ring-[#0a0a0a]" onClick={() => avatarInputRef.current?.click()}>
                        {project?.avatar ? <img src={project.avatar} className="w-full h-full object-cover" alt="Avatar"/> : <span className="text-3xl">🚀</span>}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"><Camera className="h-5 w-5 text-white" /></div>
                      </div>
                      <div className="mb-1.5">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">{project?.title || 'Dự án mới'}</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Quản lý thông tin chung của dự án.</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1">
                          Tên dự án <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={project?.title || ''}
                          onChange={(e) => setProject({...project, title: e.target.value})}
                          className="h-10 bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-0 text-sm shadow-sm"
                          placeholder="Nhập tên dự án..."
                        />
                      </div>

                      {/* [ĐÃ ẨN MÃ KEY Ở ĐÂY] */}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                          Mô tả dự án
                        </label>
                        <Textarea
                          className="min-h-[100px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-0 resize-none text-sm leading-relaxed shadow-sm"
                          value={project?.description || ''}
                          onChange={(e) => setProject({...project, description: e.target.value})}
                          placeholder="Mô tả ngắn gọn về mục tiêu và phạm vi của dự án..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. DANGER ZONE (Tối giản) */}
                  <div className="mt-10 pt-5 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-red-600 dark:text-red-500 font-bold text-sm">Xóa dự án</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Xóa vĩnh viễn dự án và tất cả dữ liệu liên quan. Không thể hoàn tác.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setDeleteProjectOpen(true)} className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold h-8 text-[10px] uppercase">
                        Xóa dự án
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: MEMBERS --- */}
              {activeTab === 'members' && (
                <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Thành viên</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Quản lý quyền truy cập và vai trò.</p>
                    </div>
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 px-4 font-bold rounded-lg transition-all h-9 text-[10px] uppercase tracking-wide gap-1.5 border-0 shadow-sm">
                          <UserPlus className="h-3.5 w-3.5" /> Mời thành viên
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md">
                        <DialogHeader><DialogTitle>Mời thành viên</DialogTitle><DialogDescription className="text-zinc-500 dark:text-zinc-400">Thêm nhân sự vào <strong>{project?.title}</strong>.</DialogDescription></DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" /><Input placeholder="Tìm kiếm..." className="pl-9 bg-zinc-50 dark:bg-[#1a1a1d] border-zinc-200 dark:border-zinc-800 focus:border-orange-500 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableUsers.length > 0 ? availableUsers.map((user) => (
                              <div key={user._id} className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-[#1a1a1d] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700"><AvatarFallback className="bg-orange-100 dark:bg-orange-600 text-orange-700 dark:text-white text-[10px] font-bold">{user.lastname[0]}</AvatarFallback></Avatar>
                                  <div className="flex flex-col"><span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{user.lastname} {user.firstname}</span><span className="text-[10px] text-zinc-500">{user.email}</span></div>
                                </div>
                                <Button size="sm" className="h-7 bg-white dark:bg-[#27272a] hover:bg-orange-600 hover:text-white text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all shadow-sm text-[10px]" onClick={() => handleAddMember(user)}>Thêm</Button>
                              </div>
                            )) : <div className="text-center py-4 text-zinc-500 text-xs">Không tìm thấy.</div>}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Table: No Card wrapper, just border */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden shadow-sm">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-zinc-50 dark:bg-[#1a1a1d] text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800"><th className="px-4 py-3 text-left font-bold">Tên</th><th className="px-4 py-3 text-left font-bold">Vai trò</th><th className="px-4 py-3 text-right font-bold">Xóa</th></tr></thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {project?.members?.map((member: any, i: number) => (
                        <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-[#1a1a1d] transition-colors">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-700"><AvatarImage src={member.avatar} /><AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{member.name ? member.name.substring(0, 2).toUpperCase() : "??"}</AvatarFallback></Avatar><span className="font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{member.name}</span></div></td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="bg-zinc-100 dark:bg-[#27272a] text-zinc-600 dark:text-zinc-400 border-0 text-[9px] font-mono h-5 px-2">MEMBER</Badge></td>
                          <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded opacity-0 group-hover:opacity-100 transition-all" onClick={() => setMemberToDelete(member)}><Trash2 className="h-4 w-4" /></Button></td>
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
        <AlertDialogContent className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl shadow-xl max-w-sm">
          <AlertDialogHeader><AlertDialogTitle className="text-red-600 dark:text-red-500 uppercase font-black italic text-sm">Cảnh báo hệ thống</AlertDialogTitle><AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Xóa thành viên <span className="font-bold text-zinc-900 dark:text-white">{memberToDelete?.name}</span>?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="h-8 text-xs bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800">Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteMember} className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0">Xác nhận</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#121214] border border-red-100 dark:border-red-900/30 text-zinc-900 dark:text-white rounded-xl shadow-2xl max-w-md">
          <AlertDialogHeader><AlertDialogTitle className="text-red-600 dark:text-red-500 uppercase font-black flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4" /> Xác nhận xóa dự án</AlertDialogTitle><AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs">Xóa vĩnh viễn <span className="font-bold text-zinc-900 dark:text-white">{project?.title}</span>? Dữ liệu không thể phục hồi.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="mt-2"><AlertDialogCancel className="h-8 text-xs bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800">Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProject} className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-bold border-0">Xóa vĩnh viễn</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}