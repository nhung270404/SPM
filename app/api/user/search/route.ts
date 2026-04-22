import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import User from '@/models/user.model';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: any) {
  return withApiHandler(req, context, async (req) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const query = searchParams.get('q') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      await connectToDatabase();

      let filter: any = { status: 'active' };
      if (query && query.length >= 2) {
        filter.$or = [
          { firstname: { $regex: query, $options: 'i' } },
          { lastname: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
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
        totalPages: Math.ceil(total / limit)
      });

    } catch (error: any) {
      console.error("❌ Lỗi API User Search:", error);
      return NextResponse.json(
        { error: error.message || "Lỗi tìm kiếm người dùng" },
        { status: 500 }
      );
    }
  });
}
