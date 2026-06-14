import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import mongoose from 'mongoose';

type ProjectData = {
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  members?: string[];
};

type ProjectDocument = ProjectData & mongoose.Document;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

const ProjectModel =
    (mongoose.models.Project as mongoose.Model<ProjectDocument>) ||
    mongoose.model<ProjectDocument>(
        'Project',
        new mongoose.Schema<ProjectData>(
            {
              title: String,
              description: String,
              status: String,
              dueDate: String,
              members: [String],
            },
            { timestamps: true }
        )
    );

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const project = await ProjectModel.findById(id);

    if (!project) {
      return NextResponse.json(
          { error: 'Không tìm thấy dự án' },
          { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: unknown) {
    return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 500 }
    );
  }
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await request.json() as ProjectData;

    const updateData: ProjectData = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.members !== undefined) updateData.members = body.members;

    const updatedProject = await ProjectModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
          { error: 'Cập nhật thất bại' },
          { status: 404 }
      );
    }

    return NextResponse.json(updatedProject);
  } catch (error: unknown) {
    return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 500 }
    );
  }
}

export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const deletedProject = await ProjectModel.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json(
          { error: 'Không tìm thấy dự án' },
          { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Đã xóa dự án thành công',
    });
  } catch (error: unknown) {
    return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 500 }
    );
  }
}