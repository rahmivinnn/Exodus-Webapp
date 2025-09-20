import { NextRequest, NextResponse } from 'next/server';
import { getGreenscreensAPI } from '@/lib/greenscreens-api';

export async function GET(request: NextRequest) {
  try {
    const greenscreensAPI = getGreenscreensAPI();
    const result = await greenscreensAPI.validateConnection();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch carrier profiles' },
        { status: 500 }
      );
    }

    // Return mock data for now
    return NextResponse.json({
      carriers: [
        {
          id: 'carrier-1',
          name: 'Fast Freight',
          rating: 4.8,
          serviceAreas: ['CA', 'NY', 'TX'],
          equipmentTypes: ['van', 'reefer'],
        }
      ]
    });
  } catch (error) {
    console.error('Carrier profiles API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}