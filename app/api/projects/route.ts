import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Project from '@/models/project.model';
import '@/models/user.model';
import Notification from '@/models/notification.model';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

type ApiRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type CreateProjectBody = {
  title?: string;
  description?: string;
  key?: string;
  manager?: string;
  members?: string[];
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function getUserDisplayName(user: unknown): string {
  if (typeof user !== 'object' || user === null) {
    return 'người dùng';
  }

  const userRecord = user as Record<string, unknown>;

  const lastname =
      typeof userRecord.lastname === 'string' ? userRecord.lastname : '';

  const firstname =
      typeof userRecord.firstname === 'string' ? userRecord.firstname : '';

  const fullName = `${lastname} ${firstname}`.trim();

  return fullName || 'người dùng';
}

export async function GET() {
  try {
    await connectToDatabase();

    const projects = await Project.find({})
        .sort({ createdAt: -1 })
        .populate('manager', 'firstname lastname email avatar')
        .populate('members', 'firstname lastname email avatar');

    return NextResponse.json(projects);
  } catch (error: unknown) {
    console.error('❌ Lỗi SERVER API Projects:', error);

    return NextResponse.json(
        {
          error: getErrorMessage(error, 'Lỗi Server Internal'),
        },
        { status: 500 }
    );
  }
}

export async function POST(
    req: NextRequest,
    context: ApiRouteContext
) {
  return withApiHandler(
      req,
      context,
      async (handlerReq: Request, user: unknown, userId: string) => {
        try {
          const body = await handlerReq.json() as CreateProjectBody;

          const title =
              typeof body.title === 'string' ? body.title.trim() : '';

          const description =
              typeof body.description === 'string'
                  ? body.description.trim()
                  : '';

          const key =
              typeof body.key === 'string' ? body.key.trim() : '';

          const bodyManager =
              typeof body.manager === 'string' ? body.manager : '';

          const bodyMembers = isStringArray(body.members)
              ? body.members
              : [];

          if (!title || !key) {
            return NextResponse.json(
                {
                  error: 'Thiếu tiêu đề hoặc mã Key dự án',
                },
                { status: 400 }
            );
          }

          await connectToDatabase();

          const normalizedKey = key.toUpperCase();

          const existingProject = await Project.findOne({
            key: normalizedKey,
          });

          if (existingProject) {
            return NextResponse.json(
                {
                  error: 'Mã Key dự án này đã tồn tại',
                },
                { status: 400 }
            );
          }

          const projectManager = bodyManager || userId;

          const projectMembers = Array.from(
              new Set([
                projectManager,
                userId,
                ...bodyMembers,
              ])
          );

          const newProject = await Project.create({
            title,
            description,
            key: normalizedKey,
            manager: projectManager,
            members: projectMembers,
            taskCount: 0,
          });

          const otherMembers = projectMembers.filter(
              (memberId) => memberId.toString() !== userId.toString()
          );

          if (otherMembers.length > 0) {
            try {
              const creatorName = getUserDisplayName(user);

              await Promise.all(
                  otherMembers.map((memberId) =>
                      Notification.create({
                        recipient: memberId,
                        type: 'info',
                        title: 'Được thêm vào dự án mới',
                        message: `Bạn đã được thêm vào dự án "${title}" bởi ${creatorName}`,
                        link: '/control/projects',
                      })
                  )
              );
            } catch (notificationError: unknown) {
              console.error(
                  'Failed to send project member notifications:',
                  notificationError
              );
            }
          }

          return NextResponse.json(newProject, { status: 201 });
        } catch (error: unknown) {
          console.error('❌ Lỗi POST API Projects:', error);

          return NextResponse.json(
              {
                error: getErrorMessage(error, 'Lỗi tạo dự án'),
              },
              { status: 500 }
          );
        }
      }
  );
}