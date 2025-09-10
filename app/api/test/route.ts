import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth, AuthenticatedRequest } from '@/lib/middleware/api-key-auth';
import { API_KEY_PERMISSIONS } from '@/lib/api-key';

// GET /api/test - Test endpoint with API key authentication
export async function GET(request: NextRequest) {
  return withApiKeyAuth([API_KEY_PERMISSIONS.SHIPMENTS_READ])(request, async (req: AuthenticatedRequest) => {
    try {
      const apiKeyInfo = req.apiKey;
      
      return NextResponse.json({
        success: true,
        message: 'API key authentication successful!',
        data: {
          apiKeyId: apiKeyInfo?.id,
          userId: apiKeyInfo?.userId,
          apiKeyName: apiKeyInfo?.name,
          permissions: apiKeyInfo?.permissions,
          timestamp: new Date().toISOString(),
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured',
          databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
        }
      });
    } catch (error) {
      console.error('Test endpoint error:', error);
      return NextResponse.json(
        { error: 'Test endpoint failed', code: 'TEST_ERROR' },
        { status: 500 }
      );
    }
  });
}

// POST /api/test - Test endpoint for creating test data
export async function POST(request: NextRequest) {
  return withApiKeyAuth([API_KEY_PERMISSIONS.SHIPMENTS_CREATE])(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { testData } = body;
      
      return NextResponse.json({
        success: true,
        message: 'Test data created successfully!',
        data: {
          receivedData: testData,
          apiKeyId: req.apiKey?.id,
          userId: req.apiKey?.userId,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Test POST endpoint error:', error);
      return NextResponse.json(
        { error: 'Test POST endpoint failed', code: 'TEST_POST_ERROR' },
        { status: 500 }
      );
    }
  });
}