import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '@/models/user.model';
import dbConnect from '@/lib/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

type AccessTokenPayload = JwtPayload & {
    userId?: string;
};

type ChangePasswordBody = {
    currentPassword?: string;
    newPassword?: string;
};

type PasswordUserDocument = {
    validPassword: (password: string) => Promise<boolean>;
    setPassword: (password: string) => Promise<void>;
    save: () => Promise<unknown>;
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error && error.message
        ? error.message
        : 'Internal Server Error';
}

async function getAuthenticatedUser(): Promise<string | null> {
    const cc = await cookies();
    const token = cc.get('accessToken')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload | string;

        if (
            typeof decoded === 'object' &&
            decoded !== null &&
            typeof decoded.userId === 'string'
        ) {
            return decoded.userId;
        }

        return null;
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const body = await req.json() as ChangePasswordBody;

        const currentPassword =
            typeof body.currentPassword === 'string'
                ? body.currentPassword
                : '';

        const newPassword =
            typeof body.newPassword === 'string'
                ? body.newPassword
                : '';

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields',
                },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findById(userId)
            .select('+password') as PasswordUserDocument | null;

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        const isMatch = await user.validPassword(currentPassword);

        if (!isMatch) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Mật khẩu hiện tại không chính xác',
                },
                { status: 400 }
            );
        }

        await user.setPassword(newPassword);
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công',
        });
    } catch (error: unknown) {
        console.error('Change Password Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: `Lỗi máy chủ: ${getErrorMessage(error)}`,
            },
            { status: 500 }
        );
    }
}