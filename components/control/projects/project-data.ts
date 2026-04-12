import { CircleDashed, Circle, Clock, CheckCircle2, XCircle } from 'lucide-react';

// --- TYPES ---
export interface Member {
  id: string;
  name: string;
  avatar: string;
}

export interface Task {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  status: string;
  assignee: Member | null;
  creator: Member | null;
  estimate: string | null;
  startDate: Date | null;
  endDate: Date | null;
  parentId?: string | null;
}

export type ActivityType = 'create' | 'update' | 'comment' | 'assign' | 'state';

export interface Activity {
  id: string;
  type: ActivityType;
  user: Member;
  content: string;
  timestamp: Date;
}

// --- CONSTANTS ---
export const columns = {
  backlog: { id: 'backlog', title: 'Backlog', icon: CircleDashed, color: 'text-zinc-500' },
  todo: { id: 'todo', title: 'To Do', icon: Circle, color: 'text-zinc-200' },
  in_progress: { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-amber-400' },
  done: { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-indigo-400' },
  canceled: { id: 'canceled', title: 'Canceled', icon: XCircle, color: 'text-red-400' },
};

export const estimates = ["1h", "2h", "3h", "4h", "5h"];

export const mockMembers: Member[] = [
  { id: '1', name: 'Nguyễn Văn A', avatar: '' },
  { id: '2', name: 'Trần Thị B', avatar: '' },
  { id: '3', name: 'Dev Team', avatar: '' },
];

export const MOCK_TASKS: Task[] = [
  {
    _id: '1', taskId: 'WEB-101', title: 'Thiết kế giao diện trang chủ', status: 'todo',
    assignee: mockMembers[0], creator: mockMembers[0], estimate: '4h', startDate: new Date(), endDate: new Date(), parentId: null
  },
  {
    _id: '2', taskId: 'WEB-102', title: 'API đăng nhập & đăng ký', status: 'in_progress',
    assignee: mockMembers[1], creator: mockMembers[0], estimate: '2h', startDate: new Date(), endDate: new Date(), parentId: null
  },
];