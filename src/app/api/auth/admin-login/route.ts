import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body || {};

    const inputUser = (email || username || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    // Flexible Admin Credential Matching
    const validUsernames = [
      'admin',
      'admin@fbsbakeryworld.com',
      'admin@fbsbaker.store',
      'admin@fbsbakeryworld.store',
      'admin@gmail.com',
    ];

    const isUserValid =
      validUsernames.includes(inputUser) ||
      inputUser.startsWith('admin') ||
      inputUser.includes('admin');

    const validPasswords = ['admin123', 'admin', 'admin2026', 'password123'];
    const isPassValid = validPasswords.includes(inputPass);

    if (isUserValid && isPassValid) {
      const adminSessionData = {
        name: 'Admin Owner',
        email: inputUser || 'admin@fbsbakeryworld.com',
        role: 'OWNER',
        loginAt: new Date().toISOString(),
      };

      const response = NextResponse.json({
        success: true,
        user: adminSessionData,
        message: 'Login Berhasil',
      });

      // Set HTTP Cookie via Response Header for Proxy Auth Guard
      response.cookies.set('fbs_admin_session', 'authenticated', {
        path: '/',
        sameSite: 'lax',
        secure: false, // compatible with HTTP & HTTPS
        httpOnly: false,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Username atau kata sandi admin tidak valid.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server Auth Error' },
      { status: 500 }
    );
  }
}
