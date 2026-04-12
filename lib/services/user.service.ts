import User from '@/models/user.model';
import Role from '@/models/role.model';
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
    .lean();

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
