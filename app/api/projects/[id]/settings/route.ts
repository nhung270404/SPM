import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import mongoose from "mongoose";

const ProjectSchema =
    mongoose.models.Project ||
    mongoose.model(
        "Project",
        new mongoose.Schema(
            {
              title: String,
              description: String,
              status: String,
              dueDate: String,
              members: Array,
            },
            { timestamps: true }
        )
    );

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const project = await ProjectSchema.findById(id);

    if (!project) {
      return NextResponse.json(
          { error: "Không tìm thấy dự án" },
          { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await request.json();

    const updatedProject = await ProjectSchema.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await dbConnect();

    const { id } = await context.params;

    await ProjectSchema.findByIdAndDelete(id);

    return NextResponse.json({ message: "Đã xóa dự án thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}