import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: { message: 'User ID is required' } },
        { status: 400 }
      )
    }

    // Get user status from database
    const { data: userData, error } = await supabase
      .from('auth_user')
      .select('id, sedar_number, status, role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch user status:', error)
      return NextResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: { user: userData }
    })

  } catch (error) {
    console.error('Check user status error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to check user status' } },
      { status: 500 }
    )
  }
}