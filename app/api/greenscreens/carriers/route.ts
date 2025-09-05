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
    const serviceArea = searchParams.get('service_area')
    const equipmentType = searchParams.get('equipment_type')
    const minRating = searchParams.get('min_rating')

    const filters = {
      ...(serviceArea && { service_area: serviceArea }),
      ...(equipmentType && { equipment_type: equipmentType }),
      ...(minRating && { min_rating: parseFloat(minRating) }),
    }

    const response = await greenscreensApi.getCarrierProfiles(filters)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch carrier profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Carrier profiles retrieved successfully'
    })
  } catch (error) {
    console.error('Carrier profiles API error:', error)
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
    const { origin, destination, equipment, weight, commodity, pickupDate, deliveryDate } = body

    if (!origin || !destination || !equipment || !pickupDate) {
      return NextResponse.json(
        { error: 'Origin, destination, equipment, and pickup date are required' },
        { status: 400 }
      )
    }

    const quoteRequest = {
      origin,
      destination,
      equipment,
      weight,
      commodity,
      pickupDate,
      deliveryDate,
    }

    const result = await greenscreensApi.getCarrierBids(quoteRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch carrier bids' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Carrier bids retrieved successfully'
    })
  } catch (error) {
    console.error('Carrier bids API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}