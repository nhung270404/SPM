import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import dbConnect from '@/lib/mongo';
import { signupSchema } from '@/lib/schemas/signup.schema';

export async function POST(
    req: Request,
    { params }: { params: Promise<Record<string, never>> }
) {
    await params;
    await dbConnect();

    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { message: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        const parsed = signupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { firstname, lastname, email, phone, password } = parsed.data;

        // ⏱ TTL cho user test (email bắt đầu bằng test_)
        const isTestUser =
            typeof email === 'string' && email.startsWith('test_');

        const expiresAt = isTestUser
            ? new Date(Date.now() + 5 * 60 * 1000) // 5 phút
            : undefined;

        const errors: Record<string, string> = {};

        if (await User.findOne({ phone })) {
            errors.phone = 'Số điện thoại đã được đăng ký!';
        }

        if (await User.findOne({ email })) {
            errors.email = 'Email đã được đăng ký!';
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                { errors },
                { status: 409 }
            );
        }

        const user = new User({
            firstname,
            lastname,
            phone,
            email,
            roles: [],
            expiresAt,
        });

        await user.setPassword(password);
        await user.save();

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('SIGNUP ERROR:', error);

        return NextResponse.json(
            { message: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}