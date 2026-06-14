import User from '@/models/user.model';
import Role from '@/models/role.model';
import Project from '@/models/project.model';
import dbConnect from '@/lib/mongo';

/**
 * Lấy danh sách tất cả người dùng từ Database
 * Bao gồm việc populate thông tin Roles để hiển thị
 */
export const getAllUsers = async () => {
  await dbConnect();
  
  // Đảm bảo Role model đã được đăng ký với Mongoose trước khi populate
  // (Mongoose đôi khi gặp lỗi missing model nếu không import trực tiếp)
  console.log('Populating users with roles...', Role.modelName);

  const users = await User.find({})
    .populate({
      path: 'roles',
      select: 'name title level'
    })
    .sort({ createdAt: -1 })
    .lean() as any[];

  // Lấy tất cả project để map vào user
  const projects = await Project.find({}).select('_id title members manager').lean() as any[];

  users.forEach(user => {
    user.projects = projects
      .filter(p => 
        (p.members && p.members.some((m: any) => m.toString() === user._id.toString())) || 
        (p.manager && p.manager.toString() === user._id.toString())
      )
      .map(p => p.title);
  });

  return users;
};

/**
 * Tìm kiếm người dùng theo ID
 */
export const getUserById = async (id: string) => {
  await dbConnect();
  const user = await User.findById(id)
    .populate('roles')
    .lean();
  return user;
};
