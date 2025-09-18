import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'

export async function GET(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let dateRange: { start: string; end: string } | undefined
    if (startDate && endDate) {
      dateRange = { start: startDate, end: endDate }
    }

    const result = await greenscreensApi.getCarrierPerformance(dateRange)

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
    console.error('Carrier performance analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}