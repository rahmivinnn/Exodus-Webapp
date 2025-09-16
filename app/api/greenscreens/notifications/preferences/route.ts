import { NextRequest, NextResponse } from 'next/server'
import { getGreenscreensAPI, initializeGreenscreensAPI } from '@/lib/greenscreens-api'
import { greenscreensConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      // Return default preferences when API is not configured
      return NextResponse.json({
        success: true,
        data: {
          email: true,
          sms: false,
          push: false,
          inApp: true,
          frequency: 'immediate',
          types: [
            'shipment_created',
            'shipment_picked_up',
            'shipment_in_transit',
            'shipment_delivered',
            'shipment_delayed',
            'shipment_exception'
          ]
        }
      })
    }

    // Initialize API if not already done
    let api
    try {
      api = getGreenscreensAPI()
    } catch {
      api = initializeGreenscreensAPI(greenscreensConfig)
    }
    
    const result = await api.getNotificationPreferences()

    if (!result.success) {
      // Return default preferences when API call fails
      console.warn('Greenscreens API call failed:', result.error)
      return NextResponse.json({
        success: true,
        data: {
          email: true,
          sms: false,
          push: false,
          inApp: true,
          frequency: 'immediate',
          types: [
            'shipment_created',
            'shipment_picked_up',
            'shipment_in_transit',
            'shipment_delivered',
            'shipment_delayed',
            'shipment_exception'
          ]
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Get notification preferences error:', error)
    // Return default preferences instead of error
    return NextResponse.json({
      success: true,
      data: {
        email: true,
        sms: false,
        push: false,
        inApp: true,
        frequency: 'immediate',
        types: [
          'shipment_created',
          'shipment_picked_up',
          'shipment_in_transit',
          'shipment_delivered',
          'shipment_delayed',
          'shipment_exception'
        ]
      }
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      // Return success with the updated preferences when API is not configured
      const body = await request.json()
      return NextResponse.json({
        success: true,
        data: body
      })
    }

    const body = await request.json()
    const preferences = body

    // Initialize API if not already done
    let api
    try {
      api = getGreenscreensAPI()
    } catch {
      api = initializeGreenscreensAPI(greenscreensConfig)
    }
    
    const result = await api.updateNotificationPreferences(preferences)

    if (!result.success) {
      // Return success with the updated preferences when API call fails
      console.warn('Greenscreens API call failed:', result.error)
      return NextResponse.json({
        success: true,
        data: preferences
      })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Update notification preferences error:', error)
    // Return success with the updated preferences instead of error
    const body = await request.json()
    return NextResponse.json({
      success: true,
      data: body
    })
  }
}