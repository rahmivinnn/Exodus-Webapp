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

    const result = await greenscreensApi.getNotificationPreferences()

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
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const preferences = body

    const result = await greenscreensApi.updateNotificationPreferences(preferences)

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
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}