import { NextRequest, NextResponse } from 'next/server';
import { createTestApiKey } from '@/lib/api-key';
import { withApiKeyAuth, AuthenticatedRequest } from '@/lib/middleware/api-key-auth';

// POST /api/api-keys/temporary - Create temporary API key for testing
export async function POST(request: NextRequest) {
  return withApiKeyAuth()(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.apiKey?.userId;
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found', code: 'USER_NOT_FOUND' },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { durationHours = 72 } = body; // Default 3 days

      // Validate duration
      if (durationHours < 1 || durationHours > 168) { // Max 1 week
        return NextResponse.json(
          { error: 'Duration must be between 1 and 168 hours', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }

      const apiKey = await createTestApiKey(userId);

      return NextResponse.json({
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key,
          permissions: apiKey.permissions,
          rateLimit: apiKey.rateLimit,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
        },
        message: `Temporary API key created successfully. Expires in ${durationHours} hours.`,
        warning: 'This is a temporary API key for testing purposes. Store it securely and do not commit it to version control.',
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating temporary API key:', error);
      return NextResponse.json(
        { error: 'Failed to create temporary API key', code: 'CREATE_ERROR' },
        { status: 500 }
      );
    }
  });
}