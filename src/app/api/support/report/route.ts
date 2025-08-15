import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      errorType = 'manual_report',
      page,
      message,
      errorStack,
      errorComponent,
      pngBase64,
      browserInfo,
      pageState,
      formData
    } = body

    // Get user ID from session or request headers if available
    const userId = request.headers.get('x-user-id') || null
    
    // Get user agent and other browser info
    const userAgent = request.headers.get('user-agent') || ''
    
    // Create the error report record
    const { data, error } = await supabase
      .from('sco_error_reports')
      .insert({
        user_id: userId,
        error_type: errorType,
        page_url: page || request.headers.get('referer') || 'unknown',
        error_message: message,
        error_stack: errorStack,
        error_component: errorComponent,
        screenshot_base64: pngBase64,
        user_agent: userAgent,
        browser_info: browserInfo || {
          platform: request.headers.get('sec-ch-ua-platform'),
          mobile: request.headers.get('sec-ch-ua-mobile'),
          userAgent: userAgent
        },
        page_state: pageState,
        form_data: formData
      })
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save error report', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logId: data.id,
      message: 'Error report saved successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const resolved = url.searchParams.get('resolved')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    let query = supabase
      .from('sco_error_reports')
      .select(`
        id,
        error_type,
        page_url,
        error_message,
        created_at,
        resolved,
        resolved_at,
        sco_users!user_id(full_name, sedar_number),
        sco_users!resolved_by(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch error reports', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ reports: data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}