import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for error pages to prevent pre-render issues
  if (request.nextUrl.pathname === '/404' || request.nextUrl.pathname === '/500') {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};