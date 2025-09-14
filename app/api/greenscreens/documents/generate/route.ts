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
    const { template_id, shipment_id, data, format } = body

    // Validate required fields
    if (!template_id || !shipment_id || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: template_id, shipment_id, data' },
        { status: 400 }
      )
    }

    const result = await greenscreensApi.generateDocument({
      template_id,
      shipment_id,
      data,
      format
    })

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
    console.error('Generate document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}