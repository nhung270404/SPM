export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastActive: string;
  avatar: string;
}

export const MOCK_USERS: User[] = [
  { id: "U-001", name: "Lý Hoàng Khiêm", email: "hoangkhiem@batek.vn", role: "Admin", department: "IT Dept", status: "Active", lastActive: "Vừa xong", avatar: "avt.jpg" },
  { id: "U-002", name: "Nguyễn Thị Tâm", email: "tam@batek.vn", role: "Staff", department: "Marketing", status: "Active", lastActive: "2 giờ trước", avatar: "tam.jpg" },
  { id: "U-003", name: "Nguyễn Hồng Nhung", email: "hongnhung@batek.vn", role: "Staff", department: "Sales", status: "Active", lastActive: "29 phút trước", avatar: "nhung.jpg" },
  { id: "U-004", name: "Bùi Văn Mạnh", email: "buimanh@batek.vn", role: "Staff", department: "HR", status: "Active", lastActive: "5 phút trước", avatar: "manh.jpg" },
  { id: "U-005", name: "Trần Tuấn Khôi", email: "trankhoi@batek.vn", role: "Intern", department: "IT Dept", status: "Inactive", lastActive: "6 trước", avatar: "khoi.jpg" },
  { id: "U-006", name: "Nguyễn Thị Phương Chi", email: "phuongchi@batek.vn", role: "Staff", department: "IT Dept", status: "Active", lastActive: "30 phút trước", avatar: "" },
  { id: "U-007", name: "Hoàng Thị Thùy Lim", email: "thuylim@batek.vn", role: "Staff", department: "Marketing", status: "Active", lastActive: "5 giờ trước", avatar: "" },
  { id: "U-008", name: "Nguyễn Minh Quân", email: "minhquan@batek.vn", role: "Staff", department: "Sales", status: "Active", lastActive: "17 phút trước", avatar: "" },
  { id: "U-009", name: "Triệu Yến Vy", email: "yenvy@batek.vn", role: "Staff", department: "HR", status: "Active", lastActive: "36 phút trước", avatar: "" },
  { id: "U-010", name: "Lý Văn Chiến", email: "vanchien@batek.vn", role: "Intern", department: "IT Dept", status: "Inactive", lastActive: "10 phút trước", avatar: "" },
];