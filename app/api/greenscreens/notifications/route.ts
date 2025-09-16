import { NextRequest, NextResponse } from 'next/server'
import { getGreenscreensAPI, initializeGreenscreensAPI } from '@/lib/greenscreens-api'
import { greenscreensConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      // Return empty notifications instead of error when API is not configured
      return NextResponse.json({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    // Initialize API if not already done
    let api
    try {
      api = getGreenscreensAPI()
    } catch {
      api = initializeGreenscreensAPI(greenscreensConfig)
    }
    
    const result = await api.getNotifications(page, limit, unreadOnly)

    if (!result.success) {
      // Return empty notifications instead of error when API call fails
      console.warn('Greenscreens API call failed:', result.error)
      return NextResponse.json({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    // Return empty notifications instead of error
    return NextResponse.json({
      success: true,
      data: {
        notifications: [],
        total: 0,
        unread: 0
      }
    })
  }
}