import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import Project from '@/models/project.model';
import User from '@/models/user.model';
import Notification from '@/models/notification.model';
import { withApiHandler } from '@/lib/api-handler';
import { isAdmin } from '@/lib/auth';

// Bắt buộc API này chạy động để luôn lấy dữ liệu mới nhất
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    if (!mongoose.models.User) {
      new User({});
    }

    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .populate('manager', 'firstname lastname email avatar')
      .populate('members', 'firstname lastname email avatar');

    return NextResponse.json(projects);

  } catch (error: any) {
    console.error("❌ Lỗi SERVER API Projects:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi Server Internal" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req, user, userId) => {
    // CHẶN: Chỉ Admin mới được tạo dự án
    if (!isAdmin(user)) {
        return NextResponse.json(
          { error: "Bạn không có quyền tạo dự án. Chỉ Quản trị viên mới thực hiện được hành động này." },
          { status: 403 }
        );
    }

    try {
      const { title, description, key, manager: bodyManager, members: bodyMembers } = await req.json();

      if (!title || !key) {
        return NextResponse.json(
          { error: "Thiếu tiêu đề hoặc mã Key dự án" },
          { status: 400 }
        );
      }

      const existingProject = await Project.findOne({ key: key.toUpperCase() });
      if (existingProject) {
        return NextResponse.json(
          { error: "Mã Key dự án này đã tồn tại" },
          { status: 400 }
        );
      }

      // Xác định Leader (Manager) của dự án
      const projectManager = bodyManager || userId;
      // Đảm bảo Manager và người tạo (Admin) luôn có trong danh sách thành viên
      const projectMembers = Array.from(new Set([projectManager, userId, ...(bodyMembers || [])]));

      const newProject = await Project.create({
        title,
        description,
        key: key.toUpperCase(),
        manager: projectManager,
        members: projectMembers,
        taskCount: 0
      });

      const otherMembers = projectMembers.filter(mId => mId.toString() !== userId.toString());
      if (otherMembers.length > 0) {
        try {
          await Promise.all(otherMembers.map(mId => 
            Notification.create({
              recipient: mId,
              type: 'info',
              title: 'Được thêm vào dự án mới',
              message: `Bạn đã được thêm vào dự án "${title}" bởi ${user.lastname} ${user.firstname}`,
              link: '/control/projects'
            })
          ));
        } catch (e) { console.error('Failed to send project member notifications:', e); }
      }

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