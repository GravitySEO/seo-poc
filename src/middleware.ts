import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }

  // Check auth for API routes
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('gravity-seo-session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
  }

  // Check auth for dashboard pages
  const token = request.cookies.get('gravity-seo-session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
