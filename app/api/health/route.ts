import { NextRequest, NextResponse } from 'next/server';
import { mongoDB } from '@/lib/mongodb';
import { prisma } from '@/lib/database';

// GET /api/health - Overall health check
export async function GET(request: NextRequest) {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: { status: 'unknown', details: {} },
      postgresql: { status: 'unknown', details: {} },
      api: { status: 'healthy', details: {} }
    }
  };

  let overallHealthy = true;

  // Check MongoDB
  try {
    const mongoService = await mongoDB;
    const mongoHealthy = await mongoService.healthCheck();
    healthStatus.services.mongodb = {
      status: mongoHealthy ? 'healthy' : 'unhealthy',
      details: {
        connected: mongoHealthy,
        database: process.env.MONGODB_DB || 'exodus_logistics',
      }
    };
    if (!mongoHealthy) overallHealthy = false;
  } catch (error) {
    healthStatus.services.mongodb = {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    overallHealthy = false;
  }

  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.postgresql = {
      status: 'healthy',
      details: {
        connected: true,
        database: 'postgresql'
      }
    };
  } catch (error) {
    healthStatus.services.postgresql = {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    overallHealthy = false;
  }

  // Set overall status
  healthStatus.status = overallHealthy ? 'healthy' : 'unhealthy';

  return NextResponse.json(healthStatus, {
    status: overallHealthy ? 200 : 503
  });
}