import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'All cookies cleared' })
  
  // Clear all possible BetterAuth cookies
  response.cookies.delete('better-auth.session_token')
  response.cookies.delete('better-auth.csrf_token')
  response.cookies.delete('session')
  response.cookies.delete('demo-session')
  
  // Set them to expire immediately as backup
  response.cookies.set('better-auth.session_token', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
  })
  response.cookies.set('better-auth.csrf_token', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
  })
  
  return response
}

export async function GET() {
  return NextResponse.json({
    message: 'Session clear endpoint - use POST to clear cookies'
  })
}