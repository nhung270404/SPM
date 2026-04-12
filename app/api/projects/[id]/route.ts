import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Project from '@/models/project.model';
import WorkItem from '@/models/work-item.model'; // Import thêm để xóa kèm task nếu cần

// --- 1. GET: Lấy thông tin chi tiết dự án (Sửa lỗi 404 của cậu) ---
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const project = await Project.findById(params.id)
      .populate('manager', 'firstname lastname email'); // Lấy thông tin người quản lý

    if (!project) {
      return NextResponse.json({ error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Lỗi lấy chi tiết dự án:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 2. PUT: Cập nhật thông tin dự án (Dùng cho nút Lưu trong Settings) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Tìm và cập nhật
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        description: body.description,
        // Không cho phép sửa 'key' để tránh lỗi ID task
        // manager: body.manager // Nếu muốn đổi manager thì mở comment này
      },
      { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (!updatedProject) {
      return NextResponse.json({ error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error("Lỗi cập nhật dự án:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 3. DELETE: Xóa dự án (Dùng cho nút Xóa dự án - Vùng nguy hiểm) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Xóa dự án
    const deletedProject = await Project.findByIdAndDelete(params.id);

    if (!deletedProject) {
      return NextResponse.json({ error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    // [Tùy chọn] Xóa luôn tất cả Task liên quan đến dự án này cho sạch DB
    await WorkItem.deleteMany({ project: params.id });

    return NextResponse.json({ message: 'Đã xóa dự án thành công' });
  } catch (error: any) {
    console.error("Lỗi xóa dự án:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}