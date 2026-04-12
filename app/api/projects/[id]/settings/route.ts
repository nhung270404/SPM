import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import mongoose from 'mongoose';

// Định nghĩa Schema nếu chưa có để tránh lỗi Schema hasn't been registered
const ProjectSchema = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  dueDate: String,
  members: Array,
}, { timestamps: true }));

/**
 * 1. GET: Lấy thông tin chi tiết của 1 dự án theo ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect(); // Kết nối database
    const { id } = params;

    const project = await ProjectSchema.findById(id);

    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * 2. PUT: Cập nhật thông tin dự án
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json(); // Lấy dữ liệu gửi từ Frontend (axios.put)

    const updatedProject = await ProjectSchema.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true } // Trả về bản ghi mới nhất sau khi sửa
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * 3. DELETE: Xóa dự án (Nếu bạn muốn làm thêm nút Xóa dự án)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    await ProjectSchema.findByIdAndDelete(id);
    return NextResponse.json({ message: "Đã xóa dự án thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}