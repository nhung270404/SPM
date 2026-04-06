import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/user.model';
import dbConnect from '@/lib/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function GET() {
    try {
        const cc = await cookies();
        const token = cc.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET!) as any;

        await dbConnect();

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });

    } catch (error) {
        console.error('Account API Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
