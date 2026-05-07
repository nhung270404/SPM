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
  ShieldCheck, MailPlus, Loader2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const router = useRouter();

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
          status: u.status === 'active' ? 'Active' : 'Offline',
          lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('vi-VN') : 'Vừa xong',
          avatar: u.avatar || ''
        }));
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
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1 w-6 bg-[#36caf1] rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#36caf1]">Nhân sự hệ thống</span>
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

          {isAdmin && (
            <Button className="h-9 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 transition-all font-black text-[11px] uppercase tracking-wider group" asChild>
              <Link href="/control/user/create">
                <UserPlus className="mr-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                Thêm thành viên
              </Link>
            </Button>
          )}
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
                      <TableHead className="min-w-[180px] py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Vị trí / Phòng ban</TableHead>
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
                                  "text-[9px] font-black px-2 py-0.5 rounded-lg border-none shadow-sm uppercase tracking-tighter",
                                  user.role === 'Admin' || user.role === 'Quản trị viên'
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                                    : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
                                )}
                              >
                                {user.role}
                              </Badge>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.department}</span>
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
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item">
                                  <UserIcon className="h-4 w-4 text-cyan-500 group-hover/item:scale-110 transition-transform" />
                                  <span className="font-bold text-xs uppercase tracking-wider">Xem chi tiết</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item">
                                  <MailPlus className="h-4 w-4 text-indigo-500 group-hover/item:scale-110 transition-transform" />
                                  <span className="font-bold text-xs uppercase tracking-wider">Gửi mail</span>
                                </DropdownMenuItem>
                                
                                {isAdmin && (
                                  <>
                                    <DropdownMenuSeparator className="my-1.5 opacity-50" />
                                    <DropdownMenuItem 
                                      className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 text-red-600 transition-all group/item"
                                      onClick={() => {
                                        if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${user.name}?`)) {
                                          toast.error("Chức năng xóa đang được phát triển");
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="font-black text-xs uppercase tracking-wider">Xóa dữ liệu</span>
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
    </div>
  );
}