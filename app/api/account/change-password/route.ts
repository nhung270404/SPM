import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { changePasswordById } from '@/lib/services/auth.service';

type ApiRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
      ? error.message
      : 'Internal Server Error';
}

export async function POST(
    req: NextRequest,
    context: ApiRouteContext
) {
  return withApiHandler(
      req,
      context,
      async (handlerReq: Request, _user: unknown, userId: string) => {
        try {
          const body = await handlerReq.json() as ChangePasswordBody;

          const currentPassword =
              typeof body.currentPassword === 'string'
                  ? body.currentPassword
                  : '';

          const newPassword =
              typeof body.newPassword === 'string'
                  ? body.newPassword
                  : '';

          if (!currentPassword || !newPassword) {
            return NextResponse.json(
                {
                  success: false,
                  message: 'Missing fields',
                },
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
                {
                  success: false,
                  message: result.message,
                },
                { status: 400 }
            );
          }

          return NextResponse.json({
            success: true,
          });
        } catch (error: unknown) {
          return NextResponse.json(
              {
                success: false,
                message: getErrorMessage(error),
              },
              { status: 500 }
          );
        }
      }
  );
}