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
    const { 
      origin, 
      destination, 
      equipment, 
      weight, 
      commodity, 
      pickupDate, 
      deliveryDate,
      carrierIds 
    } = body

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
      carrierIds
    }

    const response = await greenscreensApi.getCarrierQuotes(quoteRequest)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch carrier quotes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Carrier quotes retrieved successfully'
    })
  } catch (error) {
    console.error('Carrier quotes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}