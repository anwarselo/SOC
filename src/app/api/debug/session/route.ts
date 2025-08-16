import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = getSessionCookie(request)
    const cookies = request.cookies.getAll()
    const localStorage = request.headers.get('x-local-storage') || 'Not provided'
    
    return NextResponse.json({
      sessionCookie: sessionCookie ? 'Present' : 'Not found',
      allCookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
      localStorage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}