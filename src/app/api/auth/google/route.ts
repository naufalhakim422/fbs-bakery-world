import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Fallback client ID (replace with your actual client ID in production)
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '101297846532-khfk0ed8fmd76soptcrvre3ghlt0li8a.apps.googleusercontent.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const credential = searchParams.get('credential');

  if (!credential) {
    return NextResponse.json({ success: false, message: 'Missing credential' }, { status: 400 });
  }

  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const user = {
      id: payload.sub,
      name: payload.name || 'Pengguna Google',
      email: payload.email,
      provider: 'GOOGLE' as const,
    };

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[Google Auth API] Error verifying token:', error);
    return NextResponse.json({ success: false, message: 'Invalid Google credential' }, { status: 400 });
  }
}
