import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionCookie } from 'better-auth/cookies'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get all users for admin dashboard
    const { data: users, error } = await supabase
      .from('auth_user')
      .select('id, email, full_name, sedar_number, role, status, phone_number, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch users:', error)
      return NextResponse.json(
        { error: { message: 'Failed to fetch users' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { users } })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch users' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionCookie = getSessionCookie(request)
    if (!sessionCookie) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const { userId, status } = await request.json()

    if (!userId || !status) {
      return NextResponse.json(
        { error: { message: 'User ID and status are required' } },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: { message: 'Invalid status. Must be pending, approved, or rejected' } },
        { status: 400 }
      )
    }

    // Update user status
    const { data, error } = await supabase
      .from('auth_user')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Failed to update user status:', error)
      return NextResponse.json(
        { error: { message: 'Failed to update user status' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { user: data?.[0] },
      message: `User status updated to ${status}`
    })

  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update user status' } },
      { status: 500 }
    )
  }
}