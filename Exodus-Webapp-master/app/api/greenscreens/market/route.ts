import { NextRequest, NextResponse } from 'next/server';
import { getGreenscreensAPI } from '@/lib/greenscreens-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const region = searchParams.get('region');
    const type = searchParams.get('type') || 'intelligence';

    const greenscreensAPI = getGreenscreensAPI();

    if (type === 'trends') {
      // Get market trends
      const result = await greenscreensAPI.getMarketTrends(region || undefined);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to fetch market trends' },
          { status: 500 }
        );
      }

      return NextResponse.json(result.data);
    } else {
      // Get market intelligence for specific lane
      if (!origin || !destination) {
        return NextResponse.json(
          { error: 'Origin and destination are required for market intelligence' },
          { status: 400 }
        );
      }

      const result = await greenscreensAPI.getMarketIntelligence(origin, destination);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to fetch market intelligence' },
          { status: 500 }
        );
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error('Market intelligence API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}