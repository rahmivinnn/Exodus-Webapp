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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const shipmentId = formData.get('shipment_id') as string
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const metadataStr = formData.get('metadata') as string

    // Validate required fields
    if (!file || !shipmentId || !type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: file, shipment_id, type, name' },
        { status: 400 }
      )
    }

    // Parse metadata if provided
    let metadata
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid metadata JSON' },
          { status: 400 }
        )
      }
    }

    const result = await greenscreensApi.uploadDocument({
      file,
      shipment_id: shipmentId,
      type: type as any,
      name,
      metadata
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
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}