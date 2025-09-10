import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService, CreateApiKeyRequest, API_KEY_PERMISSIONS, DEFAULT_PERMISSIONS } from '@/lib/api-key';
import { withApiKeyAuth, AuthenticatedRequest } from '@/lib/middleware/api-key-auth';

// GET /api/api-keys - Get user's API keys
export async function GET(request: NextRequest) {
  return withApiKeyAuth([API_KEY_PERMISSIONS.USERS_READ])(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.apiKey?.userId;
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }

      const apiKeys = await apiKeyService.getUserApiKeys(userId);
      
      // Remove sensitive information
      const sanitizedKeys = apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        permissions: key.permissions,
        lastUsed: key.lastUsed,
        usageCount: key.usageCount,
        rateLimit: key.rateLimit,
        isActive: key.isActive,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      }));

      return NextResponse.json({
        success: true,
        data: sanitizedKeys,
        count: sanitizedKeys.length,
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }
  });
}

// POST /api/api-keys - Create new API key
export async function POST(request: NextRequest) {
  return withApiKeyAuth([API_KEY_PERMISSIONS.USERS_UPDATE])(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.apiKey?.userId;
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { name, permissions, rateLimit, expiresAt } = body;

      if (!name) {
        return NextResponse.json(
          { error: 'Name is required', code: 'MISSING_NAME' },
          { status: 400 }
        );
      }

      // Validate permissions
      const validPermissions = Object.values(API_KEY_PERMISSIONS);
      const invalidPermissions = permissions?.filter((p: string) => !validPermissions.includes(p as any));
      
      if (invalidPermissions && invalidPermissions.length > 0) {
        return NextResponse.json(
          { error: `Invalid permissions: ${invalidPermissions.join(', ')}`, code: 'INVALID_PERMISSIONS' },
          { status: 400 }
        );
      }

      const createRequest: CreateApiKeyRequest = {
        name,
        permissions: permissions || DEFAULT_PERMISSIONS.USER,
        userId,
        rateLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      };

      const apiKey = await apiKeyService.createApiKey(createRequest);

      return NextResponse.json({
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key, // Only return the key on creation
          permissions: apiKey.permissions,
          rateLimit: apiKey.rateLimit,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
        },
        message: 'API key created successfully',
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating API key:', error);
      return NextResponse.json(
        { error: 'Failed to create API key', code: 'CREATE_ERROR' },
        { status: 500 }
      );
    }
  });
}