import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  const cc = await cookies();
  cc.delete('accessToken');
  redirect('/');
}
