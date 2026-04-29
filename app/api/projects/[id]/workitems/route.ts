import { NextRequest, NextResponse } from 'next/server';
import * as WorkItemService from '@/lib/services/workitem.service';
import { IWorkItem } from '@/models/work-item.model';
import { withApiHandler } from '@/lib/api-handler';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = await WorkItemService.getWorkItems(id);
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("❌ Lỗi GET Tasks:", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const { id: projectId } = await context.params;
      const body: Partial<IWorkItem> = await req.json();
      const payload = { ...body, creator: userId };
      const newTask = await WorkItemService.createWorkItem(projectId, payload);
      return NextResponse.json(newTask);
    } catch (error: any) {
      console.error("❌ Lỗi TẠO TASK:", error);
      return NextResponse.json(
        { error: error.message || 'Failed to create task' },
        { status: error.message?.includes('không được') ? 400 : 500 }
      );
    }
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withApiHandler(req, context, async (req, user, userId) => {
    try {
      const { id: projectId } = await context.params;
      const body: Partial<IWorkItem> & { comment?: string } = await req.json();
      const updatedTask = await WorkItemService.updateWorkItem(projectId, body, userId);
      return NextResponse.json(updatedTask);
    } catch (error: any) {
      console.error("❌ Lỗi PATCH TASK:", error);
      return NextResponse.json(
        { error: error.message || 'Failed to update task' },
        { status: error.message?.includes('không được') ? 400 : 500 }
      );
    }
  });
}