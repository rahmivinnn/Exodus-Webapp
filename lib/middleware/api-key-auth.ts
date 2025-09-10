import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService, ApiKeyPermission } from '../api-key';

// API Key authentication middleware
export interface AuthenticatedRequest extends NextRequest {
  apiKey?: {
    id: string;
    userId: string;
    permissions: string[];
    name: string;
  };
}

// Middleware function to authenticate API key
export function withApiKeyAuth(
  requiredPermissions: ApiKeyPermission[] = [],
  options: {
    allowPublicAccess?: boolean;
    rateLimitCheck?: boolean;
  } = {}
) {
  return async function apiKeyAuthMiddleware(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // Extract API key from headers
      const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');

      if (!apiKey) {
        if (options.allowPublicAccess) {
          return await handler(request as AuthenticatedRequest);
        }
        
        return NextResponse.json(
          { error: 'API key required', code: 'MISSING_API_KEY' },
          { status: 401 }
        );
      }

      // Validate API key
      const validation = await apiKeyService.validateApiKey(apiKey);
      
      if (!validation.isValid || !validation.apiKey) {
        return NextResponse.json(
          { error: validation.error || 'Invalid API key', code: 'INVALID_API_KEY' },
          { status: 401 }
        );
      }

      // Check permissions
      for (const permission of requiredPermissions) {
        if (!apiKeyService.hasPermission(validation.apiKey, permission)) {
          return NextResponse.json(
            { 
              error: `Insufficient permissions. Required: ${permission}`, 
              code: 'INSUFFICIENT_PERMISSIONS' 
            },
            { status: 403 }
          );
        }
      }

      // Check rate limit if enabled
      if (options.rateLimitCheck) {
        const withinRateLimit = await apiKeyService.checkRateLimit(validation.apiKey);
        if (!withinRateLimit) {
          return NextResponse.json(
            { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
            { status: 429 }
          );
        }
      }

      // Add API key info to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.apiKey = {
        id: validation.apiKey.id,
        userId: validation.apiKey.userId,
        permissions: validation.apiKey.permissions,
        name: validation.apiKey.name,
      };

      return await handler(authenticatedRequest);
    } catch (error) {
      console.error('API key authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 500 }
      );
    }
  };
}

// Helper function to check if user has specific permission
export function hasPermission(
  request: AuthenticatedRequest,
  permission: ApiKeyPermission
): boolean {
  if (!request.apiKey) {
    return false;
  }

  return apiKeyService.hasPermission(
    {
      permissions: request.apiKey.permissions,
    } as any,
    permission
  );
}

// Helper function to get user ID from request
export function getUserId(request: AuthenticatedRequest): string | null {
  return request.apiKey?.userId || null;
}

// Helper function to get API key info from request
export function getApiKeyInfo(request: AuthenticatedRequest) {
  return request.apiKey || null;
}

// Rate limiting middleware
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const apiKey = request.headers.get('x-api-key');
    const clientId = apiKey || request.ip || 'anonymous';
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }
    
    const clientData = requests.get(clientId);
    
    if (!clientData) {
      requests.set(clientId, { count: 1, resetTime: now });
    } else if (clientData.resetTime < windowStart) {
      requests.set(clientId, { count: 1, resetTime: now });
    } else if (clientData.count >= maxRequests) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((clientData.resetTime + windowMs - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((clientData.resetTime + windowMs - now) / 1000).toString()
          }
        }
      );
    } else {
      clientData.count++;
    }
    
    return handler(request);
  };
}

// CORS middleware for API endpoints
export function withCors(options: {
  origin?: string | string[];
  methods?: string[];
  headers?: string[];
} = {}) {
  const defaultOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'x-api-key'],
  };

  const corsOptions = { ...defaultOptions, ...options };

  return function corsMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(corsOptions.origin) 
            ? corsOptions.origin.join(', ') 
            : corsOptions.origin,
          'Access-Control-Allow-Methods': corsOptions.methods.join(', '),
          'Access-Control-Allow-Headers': corsOptions.headers.join(', '),
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = handler(request);
    
    return response.then(res => {
      const newResponse = res.clone();
      newResponse.headers.set(
        'Access-Control-Allow-Origin',
        Array.isArray(corsOptions.origin) 
          ? corsOptions.origin.join(', ') 
          : corsOptions.origin
      );
      newResponse.headers.set(
        'Access-Control-Allow-Methods',
        corsOptions.methods.join(', ')
      );
      newResponse.headers.set(
        'Access-Control-Allow-Headers',
        corsOptions.headers.join(', ')
      );
      
      return newResponse;
    });
  };
}

// Error handling middleware
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function errorHandlingMiddleware(
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      const errorResponse = {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      };

      return NextResponse.json(errorResponse, { status: 500 });
    }
  };
}

// Combined middleware for API endpoints
export function createApiMiddleware(options: {
  requiredPermissions?: ApiKeyPermission[];
  allowPublicAccess?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  cors?: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
  };
} = {}) {
  const middlewares = [];

  // Add CORS middleware
  if (options.cors !== false) {
    middlewares.push(withCors(options.cors));
  }

  // Add rate limiting middleware
  if (options.rateLimit) {
    middlewares.push(withRateLimit(options.rateLimit.maxRequests, options.rateLimit.windowMs));
  }

  // Add API key authentication middleware
  if (!options.allowPublicAccess) {
    middlewares.push(withApiKeyAuth(options.requiredPermissions || [], {
      allowPublicAccess: options.allowPublicAccess,
      rateLimitCheck: !!options.rateLimit,
    }));
  }

  // Add error handling middleware
  middlewares.push(withErrorHandling);

  return middlewares.reduce((acc, middleware) => {
    return (request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => {
      return middleware(request, () => acc(request, handler));
    };
  });
}

export default withApiKeyAuth;