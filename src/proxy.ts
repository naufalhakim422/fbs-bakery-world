import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /admin and /admin/* to /admin2026 equivalent
  // This ensures the browser URL always shows /admin2026
  if (pathname === '/admin' || pathname === '/admin/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin2026';
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith('/admin/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/admin/', '/admin2026/');
    return NextResponse.redirect(url, 308);
  }

  // Internally rewrite /admin2026/* → /admin/* (keeps URL as /admin2026 in browser)
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
