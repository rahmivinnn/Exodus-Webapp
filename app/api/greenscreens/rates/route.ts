import { NextRequest, NextResponse } from 'next/server';
import { getGreenscreensAPI } from '@/lib/greenscreens-api';

export async function GET(request: NextRequest) {
  try {
    const greenscreensAPI = getGreenscreensAPI();
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const equipment = searchParams.get('equipment') || 'van';

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const result = await greenscreensAPI.getRatePrediction(origin, destination, equipment);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch rate prediction' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Rate prediction API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const greenscreensAPI = getGreenscreensAPI();
    const body = await request.json();
    const { lanes } = body;

    if (!lanes || !Array.isArray(lanes)) {
      return NextResponse.json(
        { error: 'Lanes array is required' },
        { status: 400 }
      );
    }

    const result = await greenscreensAPI.getBatchRates(lanes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch batch rates' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Batch rates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}