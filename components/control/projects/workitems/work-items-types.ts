import { 
  Circle, HelpCircle, Clock, CheckCircle2, X, ArrowUpCircle, MoreHorizontal 
} from 'lucide-react';

export type Task = {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Cancel';
  priority: 'Low' | 'Medium' | 'High';
  assignee: any | null;
  startDate: Date | null;
  endDate: Date | null;
  estimate: any | null;
  parentId?: string | null;
  creator: any;
};

export const columns = {
  'Backlog': { id: 'Backlog', title: 'Backlog', icon: HelpCircle, color: 'text-slate-500' },
  'Todo': { id: 'Todo', title: 'To Do', icon: Circle, color: 'text-cyan-500' },
  'In Progress': { id: 'In Progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
  'Done': { id: 'Done', title: 'Done', icon: CheckCircle2, color: 'text-green-600' },
  'Cancel': { id: 'Cancel', title: 'Canceled', icon: X, color: 'text-red-500' },
};

export const STATUS_OPTIONS = [
  { value: 'Backlog', label: 'Backlog', icon: HelpCircle, color: 'text-slate-500' },
  { value: 'Todo', label: 'To Do', icon: Circle, color: 'text-cyan-500' },
  { value: 'In Progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { value: 'Done', label: 'Done', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'Cancel', label: 'Canceled', icon: X, color: 'text-red-500' },
];

export const IMPORTANCE_OPTIONS: {
  value: 'Low' | 'Medium' | 'High';
  label: string;
  icon: any;
  color: string;
}[] = [
  { value: 'High', label: 'High', icon: ArrowUpCircle, color: 'text-cyan-500' },
  { value: 'Medium', label: 'Medium', icon: MoreHorizontal, color: 'text-blue-500' },
  { value: 'Low', label: 'Low', icon: ArrowUpCircle, color: 'text-slate-500 rotate-180' },
];

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  'Backlog': ['Todo', 'Cancel'],
  'Todo': ['Cancel', 'In Progress', 'Done'],
  'In Progress': ['Done', 'Todo', 'Cancel'],
  'Done': ['Todo'],
  'Cancel': ['Todo'],
};

export const estimates = [1, 2, 3, 5, 8, 13, -1];


