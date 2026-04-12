import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Định nghĩa Interface cho TypeScript (giúp code gợi ý chuẩn)
export interface IWorkItem extends Document {
  title: string;
  description?: string;
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Cancel';
  priority: 'Low' | 'Medium' | 'High';
  project: mongoose.Types.ObjectId; // Link tới Project
  assignee?: mongoose.Types.ObjectId; // Link tới User
  startDate?: Date;
  dueDate?: Date;
  estimate?: number;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
}

// 2. Định nghĩa Schema Mongoose (Cấu trúc lưu trong DB)
const WorkItemSchema: Schema<IWorkItem> = new Schema(
  {
    taskId: { type: String, required: true, unique: true },

    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên công việc'],
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Backlog', 'Todo', 'In Progress', 'Done', 'Cancel'],
      default: 'Todo',
      index: true, // Đánh index để query thống kê nhanh hơn
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project', // Quan trọng: Phải khớp tên model Project của cậu
      required: true,
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Quan trọng: Phải khớp tên model User
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    estimate: {
      type: Number,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// 3. Export Model (Xử lý lỗi OverwriteModelError trong Next.js)
const WorkItem: Model<IWorkItem> =
  mongoose.models.WorkItem || mongoose.model<IWorkItem>('WorkItem', WorkItemSchema);

export default WorkItem;