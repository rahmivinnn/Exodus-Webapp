import { NextRequest, NextResponse } from 'next/server'
import { greenscreensApi } from '@/lib/greenscreens-api'

export async function GET(request: NextRequest) {
  try {
    // Check if Greenscreens.ai API is configured
    if (!process.env.GREENSCREENS_API_KEY || !process.env.GREENSCREENS_API_URL) {
      return NextResponse.json(
        { error: 'Greenscreens.ai API not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const result = await greenscreensApi.getDocumentTemplates(
      type as any
    )

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
    console.error('Get document templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}