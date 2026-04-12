import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import dbConnect from '@/lib/mongo';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const field = searchParams.get('field');
        const value = searchParams.get('value');

        if (!field || !value) {
            return NextResponse.json({ exists: false }, { status: 400 });
        }

        if (field !== 'email' && field !== 'phone') {
            return NextResponse.json({ exists: false }, { status: 400 });
        }

        const user = await User.findOne({ [field]: value }).lean();

        return NextResponse.json({ exists: !!user });
    } catch (error) {
        console.error('CHECK ERROR:', error);
        return NextResponse.json({ message: 'Internal Server Error', exists: false }, { status: 500 });
    }
}
