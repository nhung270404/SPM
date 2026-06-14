import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { withApiHandler } from '@/lib/api-handler';
import Notification from '@/models/notification.model';

export const dynamic = 'force-dynamic';

type ApiRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type NotificationPatchBody = {
  id?: string;
  markAll?: boolean;
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
          const notifications = await Notification.find({
            recipient: userId,
          })
              .sort({ createdAt: -1 })
              .limit(50);

          return NextResponse.json(notifications);
        } catch (error: unknown) {
          return NextResponse.json(
              {
                error: getErrorMessage(error),
              },
              { status: 500 }
          );
        }
      }
  );
}

export async function PATCH(
    req: NextRequest,
    context: ApiRouteContext
) {
  return withApiHandler(
      req,
      context,
      async (handlerReq: Request, _user: unknown, userId: string) => {
        try {
          const body = await handlerReq.json() as NotificationPatchBody;

          const id = typeof body.id === 'string' ? body.id : '';
          const markAll = body.markAll === true;

          if (markAll) {
            await Notification.updateMany(
                {
                  recipient: userId,
                  isRead: false,
                },
                {
                  isRead: true,
                }
            );

            return NextResponse.json({
              success: true,
            });
          }

          if (id) {
            if (!Types.ObjectId.isValid(id)) {
              return NextResponse.json(
                  {
                    error: 'Invalid notification id',
                  },
                  { status: 400 }
              );
            }

            const updated = await Notification.findOneAndUpdate(
                {
                  _id: id,
                  recipient: userId,
                },
                {
                  isRead: true,
                },
                {
                  new: true,
                }
            );

            if (!updated) {
              return NextResponse.json(
                  {
                    error: 'Notification not found',
                  },
                  { status: 404 }
              );
            }

            return NextResponse.json({
              success: true,
            });
          }

          return NextResponse.json(
              {
                error: 'Missing parameters',
              },
              { status: 400 }
          );
        } catch (error: unknown) {
          return NextResponse.json(
              {
                error: getErrorMessage(error),
              },
              { status: 500 }
          );
        }
      }
  );
}