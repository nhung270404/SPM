import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import User from '@/models/user.model';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

type ApiRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

type RegexSearch = {
  $regex: string;
  $options: 'i';
};

type UserSearchFilter = {
  status: 'active';
  $or?: Array<{
    firstname?: RegexSearch;
    lastname?: RegexSearch;
    email?: RegexSearch;
  }>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Lỗi tìm kiếm người dùng';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(
    req: NextRequest,
    context: ApiRouteContext
) {
  return withApiHandler(req, context, async (handlerReq: NextRequest) => {
    try {
      const searchParams = handlerReq.nextUrl.searchParams;

      const query = searchParams.get('q')?.trim() || '';

      const page = Math.max(
          Number.parseInt(searchParams.get('page') || '1', 10),
          1
      );

      const limit = Math.max(
          Number.parseInt(searchParams.get('limit') || '10', 10),
          1
      );

      const skip = (page - 1) * limit;

      await connectToDatabase();

      const filter: UserSearchFilter = {
        status: 'active',
      };

      if (query.length >= 2) {
        const safeQuery = escapeRegExp(query);

        filter.$or = [
          {
            firstname: {
              $regex: safeQuery,
              $options: 'i',
            },
          },
          {
            lastname: {
              $regex: safeQuery,
              $options: 'i',
            },
          },
          {
            email: {
              $regex: safeQuery,
              $options: 'i',
            },
          },
        ];
      }

      const total = await User.countDocuments(filter);

      const users = await User.find(filter)
          .select('firstname lastname email avatar')
          .skip(skip)
          .limit(limit);

      return NextResponse.json({
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error: unknown) {
      console.error('❌ Lỗi API User Search:', error);

      return NextResponse.json(
          {
            error: getErrorMessage(error),
          },
          { status: 500 }
      );
    }
  });
}