import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Set secure auth cookie
      const cookieStore = cookies();
      cookieStore.set('admin_token', 'liquid-admin-authenticated-session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true, message: 'Authentication successful' });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}

