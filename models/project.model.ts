import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Interface TypeScript
export interface IProject extends Document {
  title: string;
  description?: string;
  key: string;
  taskCount: number;
  manager: mongoose.Types.ObjectId;   // <--- QUAN TRỌNG: Phải có dòng này
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema Mongoose
const ProjectSchema: Schema<IProject> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên dự án'],
      trim: true,
    },
    description: {
      type: String,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    taskCount: {
      type: Number,
      default: 0,
    },
    // --- QUAN TRỌNG: Phải khai báo trường manager ở đây ---
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Liên kết tới bảng User
      // required: true, // Tạm thời bỏ required để tránh lỗi với dữ liệu cũ
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 3. Export Model
const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;