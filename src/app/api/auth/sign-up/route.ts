import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, sedarNumber, phoneNumber } = await request.json()

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          sedar_number: sedarNumber,
          phone_number: phoneNumber,
          role: 'agent',
          status: 'pending', // Requires admin approval
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Return success but indicate approval needed
    return NextResponse.json({ 
      message: 'Registration successful. Awaiting admin approval.',
      user: data.user,
      requiresApproval: true
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' }, 
      { status: 400 }
    )
  }
}