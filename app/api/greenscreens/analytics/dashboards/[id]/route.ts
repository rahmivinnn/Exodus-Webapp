import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured' },
        { status: 500 }
      )
    }

    const dashboardId = params.id
    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates = body

    const result = await greenscreensApi.updateCustomDashboard(dashboardId, updates)

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
    console.error('Update custom dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}