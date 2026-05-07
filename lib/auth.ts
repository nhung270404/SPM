import jwt from 'jsonwebtoken';
import { IUser } from '@/models/user.model';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import dbConnect from '@/lib/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Xác thực token JWT và lấy thông tin User đầy đủ từ Database
 */
export async function verifyToken(token: string): Promise<IUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.userId) return null;

    await dbConnect();
    // Fetch user thực tế từ DB và populate roles để kiểm tra level
    const user = await User.findById(decoded.userId).populate('roles');
    return user;
  } catch (err) {
    console.error('Token không hợp lệ hoặc lỗi DB:', err);
    return null;
  }
}

/**
 * Kiểm tra xem user có phải là Admin hay không (Level <= 1)
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;
  
  // Nếu roles đã được populate (là mảng object)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((role: any) => {
        if (typeof role === 'object' && role !== null) {
            return role.level <= 1;
        }
        return false;
    });
  }
  
  return false;
}
