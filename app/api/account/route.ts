import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/user.model';
import Role from '@/models/role.model'; // Import Role to register schema
import dbConnect from '@/lib/mongo';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

async function getAuthenticatedUser() {
    const cc = await cookies();
    const token = cc.get('accessToken')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as any;
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const userId = await getAuthenticatedUser();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        
        // Cần populate 'roles' để frontend biết user có level mấy (Admin hay Member)
        const user = await User.findById(userId).populate('roles');

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });

    } catch (error) {
        console.error('Account GET Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUser();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const firstname = formData.get('firstname') as string;
        const lastname = formData.get('lastname') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const avatarFile = formData.get('avatar') as File | null;

        await dbConnect();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
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
            
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {}

            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            
            user.avatar = `/uploads/${fileName}`;
        }

        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Cập nhật thành công',
            data: user 
        });

    } catch (error: any) {
        console.error('Account PUT Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Lỗi máy chủ: ' + error.message 
        }, { status: 500 });
    }
}
