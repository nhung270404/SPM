import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongo';
import { verifyToken } from '@/lib/auth';
import { IUser } from '@/models/user.model';

type ApiContext = {
  params: Promise<any>;
};

type ApiHandler = (
  req: NextRequest,
  user: IUser,
  userId: string,
  context: ApiContext
) => Promise<NextResponse>;

export async function withApiHandler(
  req: NextRequest,
  context: ApiContext,
  handler: ApiHandler
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    await dbConnect();

    const userId = (user as any).userId || user._id?.toString() || user._id;

    return await handler(req, user, userId, context);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}