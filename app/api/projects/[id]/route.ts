import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Project from '@/models/project.model';
import WorkItem from '@/models/work-item.model'; // Import thêm để xóa kèm task nếu cần

// --- 1. GET: Lấy thông tin chi tiết dự án (Sửa lỗi 404 của cậu) ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const project = await Project.findById(id)
      .populate('manager', 'firstname lastname email avatar')
      .populate('members', 'firstname lastname email avatar'); // Lấy thông tin thành viên

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await request.json();

    // Tìm và cập nhật - Chỉ cập nhật các trường có trong body
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.members !== undefined) updateData.members = body.members;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Xóa dự án
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json({ error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    // [Tùy chọn] Xóa luôn tất cả Task liên quan đến dự án này cho sạch DB
    await WorkItem.deleteMany({ project: id });

    return NextResponse.json({ message: 'Đã xóa dự án thành công' });
  } catch (error: any) {
    console.error("Lỗi xóa dự án:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}