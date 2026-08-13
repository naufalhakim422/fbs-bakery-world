import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Canonical domain redirect: fbsbaker.store -> www.fbsbaker.store
  if (host === 'fbsbaker.store') {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.hostname = 'www.fbsbaker.store';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // Handle any admin route starting with /admin (including typos like /admin20262026)
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin2026/login' || pathname === '/admin/login';

    // Redirect legacy /admin/login to /admin2026/login
    if (pathname === '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin2026/login';
      return NextResponse.redirect(url, 308);
    }

    if (isLoginPage) {
      return NextResponse.next();
    }

    const adminSession =
      request.cookies.get('fbs_admin_session')?.value ||
      request.cookies.get('next-auth.session-token')?.value;

    // Check if user is logged in
    if (!adminSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin2026/login';
      loginUrl.searchParams.set('callbackUrl', pathname.startsWith('/admin2026') ? pathname : '/admin2026');
      return NextResponse.redirect(loginUrl);
    }

    // Standardize legacy /admin paths to /admin2026
    if (pathname === '/admin' || pathname === '/admin/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin2026';
      return NextResponse.redirect(url, 308);
    }

    if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin2026/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace('/admin/', '/admin2026/');
      return NextResponse.redirect(url, 308);
    }

    // Catch-all for admin typos like /admin20262026 -> normalize to /admin2026
    if (!pathname.startsWith('/admin2026/') && pathname !== '/admin2026') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin2026';
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?:admin|.*).*)'],
};
