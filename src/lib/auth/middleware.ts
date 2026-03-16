import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret')

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get('gravity-seo-session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return null // null means authenticated, proceed
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}
