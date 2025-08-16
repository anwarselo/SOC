import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        sedarNumber: user.user_metadata?.sedar_number,
        phoneNumber: user.user_metadata?.phone_number,
        role: user.user_metadata?.role || 'agent',
        status: user.user_metadata?.status || 'pending'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Session check failed' }, 
      { status: 500 }
    )
  }
}