import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip auth check for login and signup endpoints
  if (request.nextUrl.pathname.startsWith('/api/v2/mobile/auth/')) {
    return NextResponse.next()
  }


  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Pass the token to the API route for validation
  const requestHeaders = new Headers(request.headers)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/api/v2/mobile/:path*',
  ]
}