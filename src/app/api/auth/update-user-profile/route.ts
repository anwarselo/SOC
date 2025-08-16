import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, sedarNumber, role, phoneNumber } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: { message: 'User ID is required' } },
        { status: 400 }
      )
    }

    // Update the auth_user table with additional fields
    const { data, error } = await supabase
      .from('auth_user')
      .update({
        sedar_number: sedarNumber,
        role: role || 'agent',
        status: 'pending',
        ...(phoneNumber && { phone_number: phoneNumber }),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Update user profile error:', error)
      return NextResponse.json(
        { error: { message: 'Failed to update user profile' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { user: data?.[0] },
      message: 'User profile updated successfully'
    })

  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update user profile' } },
      { status: 500 }
    )
  }
}