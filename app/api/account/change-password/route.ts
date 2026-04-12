import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { changePasswordById } from '@/lib/services/auth.service';

type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<any> }
) {
  return withApiHandler(req, context, async (req, _user, userId) => {
    const body: ChangePasswordBody = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 }
      );
    }

    const result = await changePasswordById(
      userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  });
}