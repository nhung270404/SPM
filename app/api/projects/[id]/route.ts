import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Project from '@/models/project.model';
import WorkItem from '@/models/work-item.model';
import Notification from '@/models/notification.model';

type RouteContext = {
    params: Promise<{ id: string }>;
};

type MemberId = string | {
    toString: () => string;
};

type ProjectUpdateBody = {
    title?: string;
    description?: string;
    avatar?: string;
    coverImage?: string;
    members?: string[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Đã xảy ra lỗi hệ thống';
}

// --- 1. GET: Lấy thông tin chi tiết dự án ---
export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        await connectToDatabase();

        const project = await Project.findById(id)
            .populate('manager', 'firstname lastname email avatar')
            .populate('members', 'firstname lastname email avatar');

        if (!project) {
            return NextResponse.json(
                { error: 'Không tìm thấy dự án' },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error: unknown) {
        console.error('Lỗi lấy chi tiết dự án:', error);

        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

// --- 2. PUT: Cập nhật thông tin dự án ---
export async function PUT(
    request: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        await connectToDatabase();

        const body = await request.json() as ProjectUpdateBody;

        const updateData: ProjectUpdateBody = {};

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.avatar !== undefined) updateData.avatar = body.avatar;
        if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
        if (body.members !== undefined) updateData.members = body.members;

        const existingProject = await Project.findById(id);

        if (!existingProject) {
            return NextResponse.json(
                { error: 'Không tìm thấy dự án' },
                { status: 404 }
            );
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (body.members && Array.isArray(body.members)) {
            const oldMemberIds = (existingProject.members as MemberId[]).map(
                (member) => member.toString()
            );

            const newMemberIds = body.members.filter(
                (memberId) => !oldMemberIds.includes(memberId.toString())
            );

            if (newMemberIds.length > 0) {
                try {
                    const projectTitle =
                        updatedProject?.title ?? existingProject.title ?? 'dự án';

                    await Promise.all(
                        newMemberIds.map((memberId) =>
                            Notification.create({
                                recipient: memberId,
                                type: 'info',
                                title: 'Được thêm vào dự án',
                                message: `Bạn vừa được thêm vào dự án "${projectTitle}"`,
                                link: '/control/projects',
                            })
                        )
                    );
                } catch (notificationError: unknown) {
                    console.error(
                        'Member notification error:',
                        notificationError
                    );
                }
            }
        }

        return NextResponse.json(updatedProject);
    } catch (error: unknown) {
        console.error('Lỗi cập nhật dự án:', error);

        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

// --- 3. DELETE: Xóa dự án ---
export async function DELETE(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        await connectToDatabase();

        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return NextResponse.json(
                { error: 'Không tìm thấy dự án' },
                { status: 404 }
            );
        }

        await WorkItem.deleteMany({ project: id });

        return NextResponse.json({
            message: 'Đã xóa dự án thành công',
        });
    } catch (error: unknown) {
        console.error('Lỗi xóa dự án:', error);

        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}