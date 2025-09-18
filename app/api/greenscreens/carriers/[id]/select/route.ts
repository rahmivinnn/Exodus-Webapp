import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'
import { getConfig } from '@/lib/config'

export async function POST(
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

    const carrierId = params.id
    if (!carrierId) {
      return NextResponse.json(
        { error: 'Carrier ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { quoteId, shipmentDetails, notes } = body

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const selectionData = {
      carrierId,
      quoteId,
      shipmentDetails,
      notes
    }

    const response = await greenscreensApi.selectCarrier(selectionData)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to select carrier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Carrier selected successfully'
    })
  } catch (error) {
    console.error('Carrier selection API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}