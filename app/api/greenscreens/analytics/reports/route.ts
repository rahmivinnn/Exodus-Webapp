import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'

export async function POST(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { date_range, report_type } = body

    // Validate required fields
    if (!date_range || !date_range.start || !date_range.end) {
      return NextResponse.json(
        { error: 'Date range with start and end dates is required' },
        { status: 400 }
      )
    }

    const result = await greenscreensApi.generateAnalyticsReport(
      { start: date_range.start, end: date_range.end },
      report_type
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Analytics report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}