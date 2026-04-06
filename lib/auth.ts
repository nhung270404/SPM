import jwt from 'jsonwebtoken';
import { IUser } from '@/models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function verifyToken(token: string): Promise<IUser | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as IUser;
  } catch (err) {
    console.error('Token không hợp lệ:', err);
    return null;
  }
}
