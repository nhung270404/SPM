import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User from '@/models/user.model';
import '@/models/role.model';
import dbConnect from '@/lib/mongo';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

type AccessTokenPayload = JwtPayload & {
    userId?: string;
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Internal Server Error';
}

function getFormString(formData: FormData, key: string): string | undefined {
    const value = formData.get(key);

    return typeof value === 'string' ? value : undefined;
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

export async function GET() {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findById(userId).populate('roles');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: user },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Account GET Error:', error);

        return NextResponse.json(
            { success: false, message: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();

        const firstname = getFormString(formData, 'firstname');
        const lastname = getFormString(formData, 'lastname');
        const email = getFormString(formData, 'email');
        const phone = getFormString(formData, 'phone');
        const address = getFormString(formData, 'address');

        const avatarValue = formData.get('avatar');
        const avatarFile = avatarValue instanceof File ? avatarValue : null;

        await dbConnect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (firstname !== undefined) user.firstname = firstname;
        if (lastname !== undefined) user.lastname = lastname;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = [address];

        if (avatarFile && avatarFile.size > 0) {
            const bytes = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const extension = path.extname(avatarFile.name) || '.png';
            const fileName = `avatar-${userId}-${Date.now()}${extension}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            await mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, fileName);

            await writeFile(filePath, buffer);

            user.avatar = `/uploads/${fileName}`;
        }

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Cập nhật thành công',
            data: user,
        });
    } catch (error: unknown) {
        console.error('Account PUT Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: `Lỗi máy chủ: ${getErrorMessage(error)}`,
            },
            { status: 500 }
        );
    }
}