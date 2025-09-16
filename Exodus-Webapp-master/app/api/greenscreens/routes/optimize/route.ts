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
    const { waypoints, vehicleType, constraints, optimization } = body

    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 waypoints are required' },
        { status: 400 }
      )
    }

    if (!vehicleType) {
      return NextResponse.json(
        { error: 'Vehicle type is required' },
        { status: 400 }
      )
    }

    const optimizationRequest = {
      waypoints,
      vehicleType,
      constraints,
      optimization: optimization || 'distance'
    }

    const response = await greenscreensApi.optimizeRoute(optimizationRequest)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to optimize route' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Route optimized successfully'
    })
  } catch (error) {
    console.error('Route optimization API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}