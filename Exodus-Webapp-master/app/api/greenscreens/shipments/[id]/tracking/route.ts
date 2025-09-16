import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'
import { getConfig } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = getConfig()
    if (!config.isValid) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured properly' },
        { status: 500 }
      )
    }

    const shipmentId = params.id
    if (!shipmentId) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      )
    }

    const response = await greenscreensApi.getShipmentTracking(shipmentId)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch shipment tracking' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Shipment tracking retrieved successfully'
    })
  } catch (error) {
    console.error('Shipment tracking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}