import dbConnect from '@/lib/mongo';
import Project from '@/models/project.model';
import User from '@/models/user.model';
import mongoose from 'mongoose';

export async function getProjects() {
  await dbConnect();
  
  // Đảm bảo model User đã được đăng ký để populate không lỗi
  if (!mongoose.models.User) {
    mongoose.model('User', User.schema);
  }

  const projects = await Project.find({})
    .sort({ createdAt: -1 })
    .populate('manager', 'firstname lastname email avatar')
    .populate('members', 'firstname lastname email avatar')
    .lean();

  return JSON.parse(JSON.stringify(projects));
}
