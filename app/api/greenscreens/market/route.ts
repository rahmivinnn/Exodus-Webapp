import { NextRequest, NextResponse } from 'next/server';
import { getGreenscreensAPI } from '@/lib/greenscreens-api';

export async function GET(request: NextRequest) {
  try {
    const greenscreensAPI = getGreenscreensAPI();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const region = searchParams.get('region');

    if (type === 'intelligence' && origin && destination) {
      const result = await greenscreensAPI.getMarketIntelligence(origin, destination);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to fetch market intelligence' },
          { status: 500 }
        );
      }

      return NextResponse.json(result.data);
    }

    if (type === 'trends') {
      const result = await greenscreensAPI.getMarketTrends(region || undefined);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to fetch market trends' },
          { status: 500 }
        );
      }

      return NextResponse.json(result.data);
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}