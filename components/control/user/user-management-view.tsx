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


// --- SUB-COMPONENT: STAT CARD ---
function StatCard({ title, value, icon: Icon, description, trend, colorClass }: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  trend?: string;
  colorClass: string;
}) {
  return (
    <Card className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/10 dark:shadow-none group hover:translate-y-[-2px] transition-all duration-300">
      <div className={cn("absolute top-0 left-0 w-1.5 h-full", colorClass)} />
      <CardContent className="p-5 lg:p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">{value}</h3>
            <div className="flex items-center gap-1.5 pt-1">
              {trend && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500">{trend}</span>}
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{description}</p>
            </div>
          </div>
          <div className={cn("p-3 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-300", colorClass.replace('bg-', 'text-'))}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserManagementView() {
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
        // Ánh xạ dữ liệu từ MongoDB sang Format của UI
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

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const adminUsers = users.filter(u => u.role === 'Admin' || u.role === 'Quản trị viên').length;

  const glassCardClass = "bg-white/60 dark:bg-slate-950/40 backdrop-blur-3xl border-white/20 dark:border-white/5 shadow-2xl shadow-slate-200/20 dark:shadow-none transition-all duration-500";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Đã đồng bộ dữ liệu nhân sự thực tế");
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
    <div className="flex flex-col h-full w-full space-y-6 lg:space-y-8 p-4 md:p-6 lg:px-10 lg:py-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(54,202,241,0.08),transparent_50%)]">

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-[#36caf1] rounded-full" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#36caf1]">Hệ thống quản trị SPM</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Nhân sự ZenWork
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm lg:text-base max-w-2xl leading-relaxed">
            Xem danh sách, phân quyền và giám sát hoạt động của đội ngũ trong toàn hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-semibold text-xs"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Đồng bộ
          </Button>

          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border-white/20 hover:bg-white transition-all font-semibold text-xs"
            onClick={handleExportExcel}
          >
            <Download className="mr-2 h-3.5 w-3.5 text-emerald-500" />
            Xuất Excel
          </Button>

          <Button className="h-10 px-5 rounded-xl bg-[#36caf1] hover:bg-[#03bdd8] text-white shadow-lg shadow-[#36caf1]/20 transition-all font-bold text-xs group" asChild>
            <Link href="/control/user/create">
              <UserPlus className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              Thêm nhân viên
            </Link>
          </Button>
        </div>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Tổng nhân sự"
          value={totalUsers}
          icon={Users}
          description="Thành viên tổ chức"
          colorClass="bg-[#36caf1]"
        />
        <StatCard
          title="Đang trực tuyến"
          value={activeUsers}
          icon={UserCheck}
          description="Hiện hành đang online"
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Quản trị viên"
          value={adminUsers}
          icon={ShieldCheck}
          description="Nhân sự cấp cao"
          colorClass="bg-indigo-500"
        />
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <Card className={cn("overflow-hidden border-none", glassCardClass)}>
        <CardHeader className="p-6 lg:p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Danh sách thành viên
              </CardTitle>
            </div>

            <div className="relative w-full md:w-80 lg:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#36caf1] transition-colors" />
              <Input
                placeholder="Tìm nhân viên, chức vụ, phòng ban..."
                className="h-11 pl-10 pr-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all ring-offset-transparent focus-visible:ring-[#36caf1]/20 font-medium text-sm"
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
                   <Loader2 className="h-10 w-10 text-[#36caf1] animate-spin" />
                   <p className="text-sm font-bold text-slate-400">Đang tải danh sách nhân sự thực tế...</p>
                </div>
             ) : (
                <Table>
                  <TableHeader className="bg-slate-50/30 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent px-2">
                      <TableHead className="min-w-[280px] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Họ và tên / Email</TableHead>
                      <TableHead className="min-w-[180px] py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 text-center">Vị trí / Phòng ban</TableHead>
                      <TableHead className="min-w-[150px] py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 text-center">Trạng thái</TableHead>
                      <TableHead className="min-w-[150px] py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Truy cập</TableHead>
                      <TableHead className="w-[80px] px-6 py-4 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id} className="group/row hover:bg-[#36caf1]/[0.02] dark:hover:bg-[#36caf1]/[0.05] border-slate-100 dark:border-slate-800 transition-all duration-300">

                          <TableCell className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-11 w-11 rounded-xl shadow-sm ring-2 ring-white dark:ring-slate-800 group-hover/row:scale-105 transition-transform duration-300">
                                <AvatarImage src={user.avatar} className="object-cover" />
                                <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 font-bold text-base uppercase">
                                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover/row:text-[#36caf1] transition-colors leading-tight">
                                  {user.name}
                                </span>
                                <span className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-none">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-md border-none",
                                  user.role === 'Admin' || user.role === 'Quản trị viên'
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                )}
                              >
                                {user.role}
                              </Badge>
                              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{user.department}</span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-center">
                            <div className="flex justify-center">
                              <Badge
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5 border-none shadow-inner",
                                  user.status === 'Active'
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                                {user.status === 'Active' ? 'Hoạt động' : 'Ngoại tuyến'}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{user.lastActive}</span>
                            </div>
                          </TableCell>

                          <TableCell className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                  <MoreHorizontal className="h-4 w-4 text-slate-400 group-hover/row:text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item">
                                  <UserIcon className="h-4 w-4 text-blue-500 group-hover/item:scale-110" />
                                  <span className="font-semibold text-sm">Xem chi tiết</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item">
                                  <Edit className="h-4 w-4 text-cyan-500 group-hover/item:scale-110" />
                                  <span className="font-semibold text-sm">Sửa hồ sơ</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item">
                                  <MailPlus className="h-4 w-4 text-[#36caf1] group-hover/item:scale-110" />
                                  <span className="font-semibold text-sm">Gửi mail</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1.5 opacity-50" />
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 text-red-600 transition-all group/item">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="font-bold text-sm text-red-600">Xóa dữ liệu</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                            <Users className="h-10 w-10" />
                            <p className="text-sm font-bold">Không tìm thấy nhân viên nào phù hợp</p>
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
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredUsers.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} trong tổng số {filteredUsers.length} thành viên
          </div>
          <div className="flex gap-1.5">
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 text-[11px] font-bold rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50" 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1 || totalPages === 0}
             >
               Trước
             </Button>
             
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
               <Button 
                 key={page}
                 variant={currentPage === page ? "default" : "outline"}
                 size="sm" 
                 className={cn(
                   "h-8 w-8 text-[11px] font-bold rounded-lg shadow-sm transition-all",
                   currentPage === page 
                     ? "bg-[#36caf1] text-white hover:bg-[#03bdd8] border-none" 
                     : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                 )}
                 onClick={() => setCurrentPage(page)}
               >
                 {page}
               </Button>
             ))}

             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 text-[11px] font-bold rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50" 
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