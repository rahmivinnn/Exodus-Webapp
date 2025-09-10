import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService, API_KEY_PERMISSIONS } from '@/lib/api-key';
import { withApiKeyAuth, AuthenticatedRequest } from '@/lib/middleware/api-key-auth';

// GET /api/api-keys/[id] - Get specific API key
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiKeyAuth([API_KEY_PERMISSIONS.USERS_READ])(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.apiKey?.userId;
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }

      const apiKey = await apiKeyService.getApiKeyById(params.id, userId);
      
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key not found', code: 'API_KEY_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Remove sensitive information
      const sanitizedKey = {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        lastUsed: apiKey.lastUsed,
        usageCount: apiKey.usageCount,
        rateLimit: apiKey.rateLimit,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
      };

      return NextResponse.json({
        success: true,
        data: sanitizedKey,
      });
    } catch (error) {
      console.error('Error fetching API key:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API key', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/api-keys/[id] - Update API key
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

      // Validate permissions if provided
      if (permissions) {
        const validPermissions = Object.values(API_KEY_PERMISSIONS);
        const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p as any));
        
        if (invalidPermissions.length > 0) {
          return NextResponse.json(
            { error: `Invalid permissions: ${invalidPermissions.join(', ')}`, code: 'INVALID_PERMISSIONS' },
            { status: 400 }
          );
        }
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (permissions !== undefined) updates.permissions = permissions;
      if (rateLimit !== undefined) updates.rateLimit = rateLimit;
      if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;

      const updatedApiKey = await apiKeyService.updateApiKey(params.id, userId, updates);
      
      if (!updatedApiKey) {
        return NextResponse.json(
          { error: 'API key not found', code: 'API_KEY_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Remove sensitive information
      const sanitizedKey = {
        id: updatedApiKey.id,
        name: updatedApiKey.name,
        permissions: updatedApiKey.permissions,
        lastUsed: updatedApiKey.lastUsed,
        usageCount: updatedApiKey.usageCount,
        rateLimit: updatedApiKey.rateLimit,
        isActive: updatedApiKey.isActive,
        expiresAt: updatedApiKey.expiresAt,
        createdAt: updatedApiKey.createdAt,
        updatedAt: updatedApiKey.updatedAt,
      };

      return NextResponse.json({
        success: true,
        data: sanitizedKey,
        message: 'API key updated successfully',
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      return NextResponse.json(
        { error: 'Failed to update API key', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/api-keys/[id] - Delete API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiKeyAuth([API_KEY_PERMISSIONS.USERS_UPDATE])(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.apiKey?.userId;
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }

      const deleted = await apiKeyService.deleteApiKey(params.id, userId);
      
      if (!deleted) {
        return NextResponse.json(
          { error: 'API key not found', code: 'API_KEY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'API key deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      return NextResponse.json(
        { error: 'Failed to delete API key', code: 'DELETE_ERROR' },
        { status: 500 }
      );
    }
  });
}