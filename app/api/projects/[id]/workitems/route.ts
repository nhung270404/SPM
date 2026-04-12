import { NextResponse } from 'next/server';
import * as WorkItemService from '@/lib/services/workitem.service';
import { IWorkItem } from '@/models/work-item.model';

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
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body:Partial<IWorkItem> = await req.json();
    const newTask = await WorkItemService.createWorkItem(projectId, body);
    return NextResponse.json(newTask);
  } catch (error: any) {
    console.error("❌ Lỗi TẠO TASK:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: error.message?.includes('không được') ? 400 : 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body:Partial<IWorkItem> = await req.json();
    const updatedTask = await WorkItemService.updateWorkItem(projectId, body);
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("❌ Lỗi PATCH TASK:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: error.message?.includes('không được') ? 400 : 500 }
    );
  }
}