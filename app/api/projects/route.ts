import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import Project from '@/models/project.model';
import User from '@/models/user.model';
import { withApiHandler } from '@/lib/api-handler';

// Bắt buộc API này chạy động để luôn lấy dữ liệu mới nhất
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Kết nối DB
    await connectToDatabase();

    // 2. Gọi nhẹ model User để đảm bảo nó đã được init (tránh lỗi "Schema hasn't been registered")
    // Không cần làm gì cả, chỉ cần import ở trên là đủ, nhưng cẩn thận thì log ra 1 cái
    if (!mongoose.models.User) {
      console.log("⚠️ Model User chưa được load, đang init...");
      // Dòng này chỉ để trigger việc load file model nếu cần
      new User({});
    }

    // 3. Query
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .populate('manager', 'firstname lastname email'); // Populate cần model User đã tồn tại

    return NextResponse.json(projects);

  } catch (error: any) {
    // [QUAN TRỌNG] In lỗi ra Terminal để biết chính xác bị gì
    console.error("❌ Lỗi SERVER API Projects:", error);

    return NextResponse.json(
      { error: error.message || "Lỗi Server Internal" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const { title, description, key } = await req.json();

      if (!title || !key) {
        return NextResponse.json(
          { error: "Thiếu tiêu đề hoặc mã Key dự án" },
          { status: 400 }
        );
      }

      // Kiểm tra trùng Key
      const existingProject = await Project.findOne({ key: key.toUpperCase() });
      if (existingProject) {
        return NextResponse.json(
          { error: "Mã Key dự án này đã tồn tại" },
          { status: 400 }
        );
      }

      const newProject = await Project.create({
        title,
        description,
        key: key.toUpperCase(),
        manager: userId,
        members: [userId], // Tự động thêm manager làm member đầu tiên
        taskCount: 0
      });

      return NextResponse.json(newProject, { status: 201 });

    } catch (error: any) {
      console.error("❌ Lỗi POST API Projects:", error);
      return NextResponse.json(
        { error: error.message || "Lỗi tạo dự án" },
        { status: 500 }
      );
    }
  });
}