import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { getOverdueWorkItems } from '@/lib/services/workitem.service';

type ApiRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
      ? error.message
      : 'Internal Server Error';
}

export async function GET(
    req: NextRequest,
    context: ApiRouteContext
) {
  return withApiHandler(
      req,
      context,
      async (_handlerReq: Request, _user: unknown, userId: string) => {
        try {
          const tasks = await getOverdueWorkItems(userId);

          return NextResponse.json({
            success: true,
            data: tasks,
          });
        } catch (error: unknown) {
          console.error('Overdue API Error:', error);

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