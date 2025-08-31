// Simplified auth for Next.js 15 compatibility
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Handle different auth endpoints
  if (pathname.includes('/session')) {
    // Return mock session for now
    return NextResponse.json({
      user: null
    })
  }
  
  if (pathname.includes('/providers')) {
    return NextResponse.json({
      credentials: {
        name: "Credentials",
        type: "credentials"
      }
    })
  }
  
  return NextResponse.json({ message: "Auth endpoint" })
}

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  if (pathname.includes('/signin')) {
    const body = await request.json()
    // Simple auth check for demo
    if (body.email === 'test@example.com' && body.password === 'password') {
      return NextResponse.json({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      })
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  return NextResponse.json({ message: "Auth endpoint" })
}