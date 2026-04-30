import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import Notification from '@/models/notification.model';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(50);
      
      return NextResponse.json(notifications);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}

export async function PATCH(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const body = await req.json();
      const { id, markAll } = body;

      if (markAll) {
        await Notification.updateMany(
          { recipient: userId, isRead: false },
          { isRead: true }
        );
        return NextResponse.json({ success: true });
      }

      if (id) {
        const updated = await Notification.findOneAndUpdate(
          { _id: id, recipient: userId },
          { isRead: true },
          { new: true }
        );
        if (!updated) {
          return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}
