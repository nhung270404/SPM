import '@/models/role.model';
import { cookies } from 'next/headers';
import { Login } from '@/lib/services/auth.service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = await Login(body);
        const cc = await cookies();
        cc.set('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
        });
        return new Response(null, {
            status: 200,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : 'Đăng nhập thất bại';

        return new Response(JSON.stringify({ error: message }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
