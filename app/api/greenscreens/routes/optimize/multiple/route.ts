import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'
import { getConfig } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const config = getConfig()
    if (!config.isValid) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured properly' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { routeRequests } = body

    if (!routeRequests || !Array.isArray(routeRequests) || routeRequests.length === 0) {
      return NextResponse.json(
        { error: 'At least one route request is required' },
        { status: 400 }
      )
    }

    // Validate each route request
    for (const [index, routeRequest] of routeRequests.entries()) {
      if (!routeRequest.waypoints || !Array.isArray(routeRequest.waypoints) || routeRequest.waypoints.length < 2) {
        return NextResponse.json(
          { error: `Route request ${index + 1}: At least 2 waypoints are required` },
          { status: 400 }
        )
      }
      if (!routeRequest.vehicleType) {
        return NextResponse.json(
          { error: `Route request ${index + 1}: Vehicle type is required` },
          { status: 400 }
        )
      }
    }

    const response = await greenscreensApi.optimizeMultipleRoutes(routeRequests)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to optimize multiple routes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Multiple routes optimized successfully'
    })
  } catch (error) {
    console.error('Multiple route optimization API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}