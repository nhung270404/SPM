'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

// Icons
import {
  Search, Plus, MoreHorizontal, Download, Trash2, Edit,
  User as UserIcon, Mail, RefreshCw, Users, UserCheck, UserPlus,
  ShieldCheck, MailPlus, Loader2, Send, FolderKanban
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { useUser } from '@/context/user-context';


// --- SUB-COMPONENT: COMPACT STAT CARD ---
function StatCard({ title, value, icon: Icon, description, colorClass }: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  colorClass: string;
}) {
  return (
    <div className="flex-1 min-w-[240px] relative overflow-hidden bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_15px_40px_rgba(54,202,241,0.1)] hover:-translate-y-1 group">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-110", colorClass.replace('bg-', 'text-'))}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{description}</span>
          </div>
        </div>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 opacity-20", colorClass)} />
    </div>
  );
}

export function UserManagementView() {
  const { user: currentUser } = useUser();
  const isAdmin = currentUser?.roles?.some((r: any) => r.level <= 1) || false;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [mailForm, setMailForm] = useState({ subject: '', message: '' });
  const [isSendingMail, setIsSendingMail] = useState(false);

  const router = useRouter();

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch('/api/user/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailForm.subject.trim() || !mailForm.message.trim()) {
      toast.error("Vui lòng điền đủ thông tin");
      return;
    }
    setIsSendingMail(true);
    try {
      const res = await fetch('/api/user/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser.email,
          subject: mailForm.subject,
          message: mailForm.message
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsMailOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsSendingMail(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user/list');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((u: any) => ({
          id: u._id,
          name: `${u.lastname} ${u.firstname}`,
          email: u.email,
          role: u.roles && u.roles.length > 0 ? (u.roles[0].title || u.roles[0].name) : (u.position || 'Nhân viên'),
          department: u.department || 'Chưa xác định',
          projects: u.projects || [],
          status: u.status === 'active' ? 'Active' : 'Offline',
          lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('vi-VN') : 'Vừa xong',
          avatar: u.avatar || ''
        }));

        // Sắp xếp: Quản trị viên lên đầu, sau đó sắp xếp theo tên (A-Z)
        mappedData.sort((a: any, b: any) => {
          const isAAdmin = a.role === 'Admin' || a.role === 'Quản trị viên';
          const isBAdmin = b.role === 'Admin' || b.role === 'Quản trị viên';
          
          if (isAAdmin && !isBAdmin) return -1;
          if (!isAAdmin && isBAdmin) return 1;
          
          return a.name.localeCompare(b.name, 'vi');
        });

        setUsers(mappedData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Không thể tải danh sách nhân sự");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- LOGIC TÍNH TOÁN SỐ LIỆU ---
  const totalUsers = users.length;
  const adminUsersCount = users.filter(u => u.role === 'Admin' || u.role === 'Quản trị viên').length;
  const regularMembersCount = totalUsers - adminUsersCount;

  const glassCardClass = "bg-white/60 dark:bg-slate-950/40 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ dữ liệu nhân sự");
    }, 500);
  };

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    const dataToExport = filteredUsers.map(user => ({
      "Mã NV": user.id, "Họ và tên": user.name, "Email": user.email,
      "Chức vụ": user.role, "Phòng ban": user.department,
      "Trạng thái": user.status, "Hoạt động cuối": user.lastActive
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanSu");
    XLSX.writeFile(workbook, `Danh_sach_nhan_su_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Xuất file Excel thành công!");
  };

  return (
    <div className="flex flex-col h-full w-full p-6 lg:p-10 lg:pt-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(54,202,241,0.05),transparent_40%)]">

      {/* --- REFINED HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 dark:from-cyan-500/30 dark:to-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Users className="h-7 w-7 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Nhân sự hệ thống
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Quản lý, phân quyền và theo dõi hoạt động của tất cả thành viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 p-1.5 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 rounded-xl text-slate-600 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all font-bold text-[11px] uppercase tracking-wider"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Đồng bộ
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 rounded-xl text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all font-bold text-[11px] uppercase tracking-wider"
            onClick={handleExportExcel}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Excel
          </Button>
        </div>
      </div>

      {/* --- COMPACT STATS ROW --- */}
      <div className="flex flex-wrap gap-4 lg:gap-5 mb-8">
        <StatCard
          title="Tổng số thành viên"
          value={totalUsers}
          icon={Users}
          description="tất cả"
          colorClass="bg-cyan-500"
        />
        <StatCard
          title="Thành viên"
          value={regularMembersCount}
          icon={UserCheck}
          description="nhân viên"
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Quản trị viên"
          value={adminUsersCount}
          icon={ShieldCheck}
          description="quản trị"
          colorClass="bg-indigo-500"
        />
      </div>

      {/* --- REFINED MAIN CONTENT --- */}
      <Card className={cn("overflow-hidden border-none", glassCardClass)}>
        <CardHeader className="p-6 lg:p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Danh sách thành viên
              </CardTitle>
            </div>

            <div className="relative w-full md:w-72 lg:w-80 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
              <Input
                placeholder="Tìm thành viên, chức vụ..."
                className="h-10 pl-10 pr-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all ring-offset-transparent focus-visible:ring-cyan-500/20 font-bold text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px]">
             {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                   <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Đang tải dữ liệu...</p>
                </div>
             ) : (
                <Table>
                  <TableHeader className="bg-slate-50/30 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[280px] px-8 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Họ và tên / Email</TableHead>
                      <TableHead className="min-w-[180px] py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Vị trí</TableHead>
                      <TableHead className="min-w-[150px] py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</TableHead>
                      <TableHead className="min-w-[150px] py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Truy cập</TableHead>
                      <TableHead className="w-[80px] px-6 py-3 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id} className="group/row hover:bg-cyan-500/[0.02] dark:hover:bg-cyan-500/[0.05] border-slate-100 dark:border-slate-800 transition-all duration-300">

                          <TableCell className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 rounded-2xl shadow-sm ring-2 ring-white dark:ring-slate-800 transition-transform duration-300 group-hover/row:scale-105">
                                <AvatarImage src={user.avatar} className="object-cover" />
                                <AvatarFallback className="bg-cyan-500 text-white font-black text-sm uppercase">
                                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover/row:text-cyan-500 transition-colors">
                                  {user.name}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                className={cn(
                                  "text-[9px] font-black px-2.5 py-1 rounded-md border-none shadow-sm uppercase tracking-widest",
                                  user.role === 'Admin' || user.role === 'Quản trị viên'
                                    ? "bg-rose-500 text-white shadow-rose-500/30 dark:bg-rose-600 dark:shadow-rose-900/30"
                                    : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
                                )}
                              >
                                {user.role}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-center">
                            <div className="flex justify-center">
                              <Badge
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[9px] font-black flex items-center gap-1.5 border-none shadow-inner uppercase tracking-widest",
                                  user.status === 'Active'
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                                {user.status === 'Active' ? 'Active' : 'Offline'}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{user.lastActive}</span>
                          </TableCell>

                          <TableCell className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                  <MoreHorizontal className="h-4 w-4 text-slate-400 group-hover/row:text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                                <DropdownMenuItem 
                                  className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item"
                                  onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                                >
                                  <UserIcon className="h-4 w-4 text-cyan-500 group-hover/item:scale-110 transition-transform" />
                                  <span className="font-bold text-xs uppercase tracking-wider">Xem chi tiết</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item"
                                  onClick={() => { setSelectedUser(user); setMailForm({subject:'', message:''}); setIsMailOpen(true); }}
                                >
                                  <MailPlus className="h-4 w-4 text-indigo-500 group-hover/item:scale-110 transition-transform" />
                                  <span className="font-bold text-xs uppercase tracking-wider">Gửi mail</span>
                                </DropdownMenuItem>
                                
                                {isAdmin && (
                                  <>
                                    <DropdownMenuSeparator className="my-1.5 opacity-50" />
                                    <DropdownMenuItem 
                                      className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all group/item",
                                        user.status === 'Active' 
                                          ? "bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 text-red-600" 
                                          : "bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                                      )}
                                      onClick={() => {
                                        if (window.confirm(`Bạn có chắc chắn muốn ${user.status === 'Active' ? 'khóa' : 'khôi phục'} tài khoản ${user.name}?`)) {
                                          handleToggleStatus(user.id);
                                        }
                                      }}
                                    >
                                      {user.status === 'Active' ? <Trash2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                      <span className="font-black text-xs uppercase tracking-wider">
                                        {user.status === 'Active' ? 'Khóa tài khoản' : 'Khôi phục'}
                                      </span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
                            <Users className="h-12 w-12" />
                            <p className="text-[11px] font-black uppercase tracking-widest">Không tìm thấy kết quả</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
             )}
          </div>
        </CardContent>

        <div className="p-6 bg-slate-50/20 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
             {filteredUsers.length} thành viên
          </div>
          <div className="flex gap-1.5">
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-400 hover:text-cyan-500 disabled:opacity-30" 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1 || totalPages === 0}
             >
               Trước
             </Button>
             
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
               <Button 
                 key={page}
                 variant="ghost"
                 size="sm" 
                 className={cn(
                   "h-8 w-8 text-[11px] font-black rounded-xl transition-all",
                   currentPage === page 
                     ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                     : "text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10"
                 )}
                 onClick={() => setCurrentPage(page)}
               >
                 {page}
               </Button>
             ))}

             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-400 hover:text-cyan-500 disabled:opacity-30" 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages || totalPages === 0}
             >
               Sau
             </Button>
          </div>
        </div>
      </Card>

      {/* MODAL: Xem chi tiết */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl bg-white dark:bg-slate-900 border-none shadow-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Thông tin nhân sự</DialogTitle>
          <div className="h-24 bg-gradient-to-r from-cyan-500 to-blue-500 w-full" />
          
          {selectedUser && (
            <div className="px-6 pb-6 pt-0 relative flex flex-col items-center">
              <Avatar className="h-24 w-24 rounded-3xl shadow-xl ring-4 ring-white dark:ring-slate-900 -mt-12 bg-white">
                <AvatarImage src={selectedUser.avatar} className="object-cover" />
                <AvatarFallback className="bg-cyan-500 text-white font-black text-3xl uppercase">
                  {selectedUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center mt-3 space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedUser.name}</h3>
                <Badge className={cn("text-[10px] uppercase font-black", selectedUser.role === 'Admin' || selectedUser.role === 'Quản trị viên' ? "bg-rose-500 text-white" : "bg-cyan-100 text-cyan-700")}>
                  {selectedUser.role}
                </Badge>
              </div>

              <div className="w-full mt-6 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Mail className="h-4 w-4 text-cyan-500" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedUser.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm mt-0.5"><FolderKanban className="h-4 w-4 text-indigo-500" /></div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dự án tham gia</span>
                    {selectedUser.projects && selectedUser.projects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUser.projects.map((p: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-white/50 dark:bg-slate-800/50 text-[10px] text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 italic">Chưa tham gia dự án nào</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <div className={cn("h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm", selectedUser.status === 'Active' ? "bg-emerald-500" : "bg-slate-400")} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {selectedUser.status === 'Active' ? 'Đang hoạt động' : 'Đã bị khóa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: Gửi Email */}
      <Dialog open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl bg-white dark:bg-slate-900 border-none shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-500">
                 <MailPlus className="h-5 w-5" />
              </div>
              Gửi Email
            </DialogTitle>
            <DialogDescription className="hidden">Gửi mail</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <form onSubmit={handleSendMail} className="py-2 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Tới nhân sự:</label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Avatar className="h-6 w-6"><AvatarImage src={selectedUser.avatar} /><AvatarFallback className="bg-cyan-500 text-white text-[10px]">{selectedUser.name.charAt(0)}</AvatarFallback></Avatar>
                  {selectedUser.name} &lt;{selectedUser.email}&gt;
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Tiêu đề thư</label>
                <Input 
                  placeholder="Ví dụ: Lịch họp dự án tuần này..."
                  value={mailForm.subject}
                  onChange={e => setMailForm({...mailForm, subject: e.target.value})}
                  className="rounded-xl border-slate-200 dark:border-slate-800 font-medium h-12 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Nội dung</label>
                <Textarea 
                  placeholder="Nhập nội dung thư muốn gửi..."
                  value={mailForm.message}
                  onChange={e => setMailForm({...mailForm, message: e.target.value})}
                  className="rounded-xl border-slate-200 dark:border-slate-800 min-h-[140px] resize-none font-medium p-4 bg-slate-50 dark:bg-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsMailOpen(false)} className="rounded-xl font-bold h-11 px-5 hover:bg-slate-100 dark:hover:bg-slate-800">Đóng</Button>
                <Button type="submit" disabled={isSendingMail} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-11 px-6 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                  {isSendingMail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Gửi thư đi
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}