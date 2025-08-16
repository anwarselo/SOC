import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create session cookie for middleware
    const sessionData = {
      userId: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'agent',
      status: data.user.user_metadata?.status || 'pending',
      sedarNumber: data.user.user_metadata?.sedar_number || '',
      fullName: data.user.user_metadata?.full_name || ''
    }

    const response = NextResponse.json({ 
      user: data.user,
      session: data.session 
    })

    // Set httpOnly session cookie for middleware
    response.cookies.set('supabase-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' }, 
      { status: 400 }
    )
  }
}