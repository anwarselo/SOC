import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { auth } from '@/server/auth/auth'

export async function POST(request: NextRequest) {
  try {
    const { employeeId, password } = await request.json()

    if (!employeeId || !password) {
      return NextResponse.json(
        { error: { message: 'Employee ID and password are required' } },
        { status: 400 }
      )
    }

    // First, find the user by sedar_number to get their email
    const { data: userData, error: userError } = await supabase
      .from('auth_user')
      .select('id, email, sedar_number, role, full_name, assigned_codes, status')
      .eq('sedar_number', employeeId.toUpperCase())
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: { message: 'Invalid employee ID or password' } },
        { status: 401 }
      )
    }

    // Check if user is approved
    if (userData.status !== 'approved') {
      return NextResponse.json(
        { error: { message: 'Your account is pending admin approval. Please contact your administrator.' } },
        { status: 403 }
      )
    }

    // For now, create a simple session manually since BetterAuth isn't connected to our DB
    // In production, you'd want to properly verify the password hash
    
    // Simple password verification for testing (in production, use proper hashing)
    // For now, accept 'admin123' for ADMIN and 'password123' for others
    const validPassword = (userData.sedar_number === 'ADMIN' && password === 'admin123') ||
                         (userData.sedar_number !== 'ADMIN' && password === 'password123')
    
    if (!validPassword) {
      return NextResponse.json(
        { error: { message: 'Invalid employee ID or password' } },
        { status: 401 }
      )
    }

    // Create response with user data
    const response = NextResponse.json({
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          sedarNumber: userData.sedar_number,
          role: userData.role,
          fullName: userData.full_name,
          assignedCodes: userData.assigned_codes
        },
        session: { 
          token: 'simple-session-token',
          userId: userData.id 
        }
      }
    })

    // Set a simple session cookie
    response.cookies.set('user-session', JSON.stringify({
      userId: userData.id,
      sedarNumber: userData.sedar_number,
      role: userData.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Employee login error:', error)
    return NextResponse.json(
      { error: { message: 'Login failed. Please try again.' } },
      { status: 500 }
    )
  }
}