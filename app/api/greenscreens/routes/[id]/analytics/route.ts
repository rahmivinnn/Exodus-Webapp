import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'
import { getConfig } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getConfig()
    if (!config.isValid) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured properly' },
        { status: 500 }
      )
    }

    const routeId = params.id
    if (!routeId) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      )
    }

    const response = await greenscreensApi.getRouteAnalytics(routeId)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to get route analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Route analytics retrieved successfully'
    })
  } catch (error) {
    console.error('Route analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}