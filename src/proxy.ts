import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Auth Guard for /admin and /admin2026 routes
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/admin2026' || pathname.startsWith('/admin2026/');
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin2026/login';

  if (isAdminRoute && !isLoginPage) {
    const adminSession = request.cookies.get('fbs_admin_session')?.value || request.cookies.get('next-auth.session-token')?.value;

    if (!adminSession && !pathname.includes('_next') && !pathname.includes('favicon.ico')) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin2026/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Redirect /admin and /admin/* to /admin2026 equivalent
  if (pathname === '/admin' || pathname === '/admin/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin2026';
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/admin/', '/admin2026/');
    return NextResponse.redirect(url, 308);
  }

  // 3. Internally rewrite /admin2026/* -> /admin/*
  if (pathname === '/admin2026' || pathname.startsWith('/admin2026/')) {
    const newPathname = pathname.replace('/admin2026', '/admin');
    const url = request.nextUrl.clone();
    url.pathname = newPathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin2026', '/admin2026/:path*'],
};
