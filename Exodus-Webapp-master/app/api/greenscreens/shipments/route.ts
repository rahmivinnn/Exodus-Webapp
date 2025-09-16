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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    const filters = {
      ...(status && { status }),
      ...(origin && { origin }),
      ...(destination && { destination }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    }

    const response = await greenscreensApi.getShipments(filters)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch shipments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Shipments retrieved successfully'
    })
  } catch (error) {
    console.error('Shipments API error:', error)
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
    
    // Validate required fields
    const requiredFields = [
      'origin.address', 'origin.city', 'origin.state', 'origin.zip',
      'destination.address', 'destination.city', 'destination.state', 'destination.zip',
      'cargo.description', 'cargo.weight', 'pickup_date', 'delivery_date'
    ]

    for (const field of requiredFields) {
      const keys = field.split('.')
      let value = body
      for (const key of keys) {
        value = value?.[key]
      }
      if (!value) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const response = await greenscreensApi.createShipment(body)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to create shipment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Shipment created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create shipment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}