import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'
import { getConfig } from '@/lib/config'

export async function PUT(
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

    const body = await request.json()
    const { status, location } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'picked_up', 'in_transit', 'delivered', 'delayed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const response = await greenscreensApi.updateShipmentStatus(shipmentId, status, location)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to update shipment status' },
        { status: response.error?.includes('not found') ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Shipment status updated successfully'
    })
  } catch (error) {
    console.error('Update shipment status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}