import { NextRequest, NextResponse } from 'next/server';
import { initializeGreenscreensAPI } from '@/lib/greenscreens-api';
import { greenscreensConfig } from '@/lib/config';

// Initialize the Greenscreens API
const greenscreensAPI = initializeGreenscreensAPI(greenscreensConfig);

export async function GET(request: NextRequest) {
  try {
    const result = await greenscreensAPI.validateConnection();

    if (!result.success) {
      return NextResponse.json(
        { 
          status: 'error',
          message: result.error || 'Failed to connect to Greenscreens API',
          connected: false
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Greenscreens API connection successful',
      connected: true,
      timestamp: new Date().toISOString(),
      ...result.data
    });
  } catch (error) {
    console.error('Health check API error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        connected: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}