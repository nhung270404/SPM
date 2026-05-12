import { NextRequest, NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api-handler';
import { getOverdueWorkItems } from '@/lib/services/workitem.service';

export async function GET(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const tasks = await getOverdueWorkItems(userId);
      
      return NextResponse.json({
        success: true,
        data: tasks
      });
    } catch (error: any) {
      console.error('Overdue API Error:', error);
      return NextResponse.json({ 
        success: false, 
        message: error.message || 'Internal Server Error' 
      }, { status: 500 });
    }
  });
}
