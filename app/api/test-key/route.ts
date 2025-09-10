import { NextRequest, NextResponse } from 'next/server';
import { createTestApiKey } from '@/lib/api-key';

// GET /api/test-key - Get or create test API key
export async function GET(request: NextRequest) {
  try {
    // Create a test user ID for testing
    const testUserId = 'test-user-' + Date.now();
    
    // Create a temporary API key for testing
    const apiKey = await createTestApiKey(testUserId);

    return NextResponse.json({
      success: true,
      message: 'Test API key created successfully!',
      data: {
        apiKey: apiKey.key,
        apiKeyId: apiKey.id,
        userId: testUserId,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        rateLimit: apiKey.rateLimit,
      },
      instructions: {
        usage: 'Use this API key in the x-api-key header for testing',
        example: 'curl -H "x-api-key: ' + apiKey.key + '" http://localhost:3000/api/test',
        expires: 'This key expires in 72 hours',
      }
    });
  } catch (error) {
    console.error('Error creating test API key:', error);
    return NextResponse.json(
      { error: 'Failed to create test API key', code: 'CREATE_ERROR' },
      { status: 500 }
    );
  }
}