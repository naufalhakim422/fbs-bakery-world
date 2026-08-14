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

  // Handle any admin route starting with /admin
  if (pathname.startsWith('/admin')) {
    // 1. Normalize legacy /admin/login to /admin2026/login
    if (pathname === '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin2026/login';
      return NextResponse.redirect(url, 308);
    }

    // 2. Normalize legacy /admin or /admin/ to /admin2026
    if (pathname === '/admin' || pathname === '/admin/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin2026';
      return NextResponse.redirect(url, 308);
    }

    // 3. Normalize legacy /admin/* to /admin2026/*
    if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin2026/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace('/admin/', '/admin2026/');
      return NextResponse.redirect(url, 308);
    }

    // 4. Catch-all for any invalid admin route/typo (e.g. /admin20262026) -> normalize FIRST to /admin2026
    if (pathname !== '/admin2026' && !pathname.startsWith('/admin2026/')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin2026';
      return NextResponse.redirect(url, 308);
    }

    // 5. Auth check for valid /admin2026 routes
    const isLoginPage = pathname === '/admin2026/login';
    if (!isLoginPage) {
      const adminSession =
        request.cookies.get('fbs_admin_session')?.value ||
        request.cookies.get('next-auth.session-token')?.value;

      if (!adminSession) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/admin2026/login';
        loginUrl.searchParams.set('callbackUrl', pathname === '/admin2026' ? '/admin2026' : pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?:admin|.*).*)'],
};
