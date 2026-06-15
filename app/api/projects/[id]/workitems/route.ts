import { NextRequest, NextResponse } from 'next/server';
import * as WorkItemService from '@/lib/services/workitem.service';
import { IWorkItem } from '@/models/work-item.model';
import { withApiHandler } from '@/lib/api-handler';
function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
function getErrorStatus(error: unknown): number {
  const message = getErrorMessage(error, '');

  return message.includes('không được') ? 400 : 500;
}
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tasks = await WorkItemService.getWorkItems(id);
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi GET tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
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
    }catch (error: unknown) {
      console.error('❌ Lỗi PATCH TASK:', error);

      return NextResponse.json(
          {
            error: getErrorMessage(error, 'Failed to update task'),
          },
          { status: getErrorStatus(error) }
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
    } catch (error: unknown) {
      console.error('❌ Lỗi GET Tasks:', error);

      return NextResponse.json(
          {
            error: getErrorMessage(error, 'Failed to fetch tasks'),
          },
          { status: 500 }
      );
    }
  });
}