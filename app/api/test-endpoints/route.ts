import { NextRequest, NextResponse } from 'next/server';
import { withApiKeyAuth, AuthenticatedRequest } from '@/lib/middleware/api-key-auth';
import { API_KEY_PERMISSIONS } from '@/lib/api-key';

// GET /api/test-endpoints - List all available test endpoints
export async function GET(request: NextRequest) {
  return withApiKeyAuth()(request, async (req: AuthenticatedRequest) => {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const apiKey = req.apiKey?.id || 'YOUR_API_KEY';

    const endpoints = {
      authentication: {
        'GET /api/test': {
          description: 'Test API key authentication',
          method: 'GET',
          url: `${baseUrl}/api/test`,
          headers: { 'x-api-key': apiKey },
          example: `curl -H "x-api-key: ${apiKey}" ${baseUrl}/api/test`
        },
        'POST /api/test': {
          description: 'Test POST with API key authentication',
          method: 'POST',
          url: `${baseUrl}/api/test`,
          headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
          body: { testData: 'Hello World' },
          example: `curl -X POST -H "x-api-key: ${apiKey}" -H "Content-Type: application/json" -d '{"testData":"Hello World"}' ${baseUrl}/api/test`
        }
      },
      apiKeyManagement: {
        'GET /api/api-keys': {
          description: 'List all API keys for user',
          method: 'GET',
          url: `${baseUrl}/api/api-keys`,
          headers: { 'x-api-key': apiKey },
          example: `curl -H "x-api-key: ${apiKey}" ${baseUrl}/api/api-keys`
        },
        'POST /api/api-keys': {
          description: 'Create new API key',
          method: 'POST',
          url: `${baseUrl}/api/api-keys`,
          headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
          body: {
            name: 'My Test API Key',
            permissions: ['shipments:read', 'tracking:read'],
            rateLimit: 500
          },
          example: `curl -X POST -H "x-api-key: ${apiKey}" -H "Content-Type: application/json" -d '{"name":"My Test API Key","permissions":["shipments:read","tracking:read"],"rateLimit":500}' ${baseUrl}/api/api-keys`
        },
        'POST /api/api-keys/temporary': {
          description: 'Create temporary API key for testing',
          method: 'POST',
          url: `${baseUrl}/api/api-keys/temporary`,
          headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
          body: { durationHours: 24 },
          example: `curl -X POST -H "x-api-key: ${apiKey}" -H "Content-Type: application/json" -d '{"durationHours":24}' ${baseUrl}/api/api-keys/temporary`
        }
      },
      healthChecks: {
        'GET /api/health': {
          description: 'Overall system health check',
          method: 'GET',
          url: `${baseUrl}/api/health`,
          example: `curl ${baseUrl}/api/health`
        },
        'GET /api/health/mongodb': {
          description: 'MongoDB health check',
          method: 'GET',
          url: `${baseUrl}/api/health/mongodb`,
          example: `curl ${baseUrl}/api/health/mongodb`
        }
      },
      testData: {
        'GET /api/test-key': {
          description: 'Get test API key (no authentication required)',
          method: 'GET',
          url: `${baseUrl}/api/test-key`,
          example: `curl ${baseUrl}/api/test-key`
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Available test endpoints',
      data: endpoints,
      currentApiKey: {
        id: req.apiKey?.id,
        userId: req.apiKey?.userId,
        name: req.apiKey?.name,
        permissions: req.apiKey?.permissions
      }
    });
  });
}