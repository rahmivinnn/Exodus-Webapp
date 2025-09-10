import { NextRequest, NextResponse } from 'next/server';
import { mongoDB } from '@/lib/mongodb';

// GET /api/health/mongodb - MongoDB health check
export async function GET(request: NextRequest) {
  try {
    const mongoService = await mongoDB;
    const isHealthy = await mongoService.healthCheck();
    
    if (isHealthy) {
      return NextResponse.json({
        status: 'healthy',
        service: 'mongodb',
        timestamp: new Date().toISOString(),
        details: {
          connected: true,
          database: process.env.MONGODB_DB || 'exodus_logistics',
        }
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        service: 'mongodb',
        timestamp: new Date().toISOString(),
        error: 'MongoDB connection failed'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('MongoDB health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      service: 'mongodb',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}