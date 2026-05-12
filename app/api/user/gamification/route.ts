import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { getGamificationStats } from '@/lib/services/workitem.service';

export async function GET(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const stats = await getGamificationStats(userId);
      return NextResponse.json({ success: true, data: stats });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  });
}
