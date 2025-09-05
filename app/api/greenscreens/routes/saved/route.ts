import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'
import { getConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const config = getConfig()
    if (!config.isValid) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured properly' },
        { status: 500 }
      )
    }

    const response = await greenscreensApi.getSavedRoutes()

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch saved routes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Saved routes retrieved successfully'
    })
  } catch (error) {
    console.error('Saved routes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { route, name } = body

    if (!route) {
      return NextResponse.json(
        { error: 'Route data is required' },
        { status: 400 }
      )
    }

    const response = await greenscreensApi.saveOptimizedRoute(route, name)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to save route' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Route saved successfully'
    })
  } catch (error) {
    console.error('Save route API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}