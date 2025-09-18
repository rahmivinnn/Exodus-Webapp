/**
 * Rate limiting utilities for API routes
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for rate limiting
const store = new Map<string, { count: number; resetTime: number }>();

export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => {
        try {
          // Default key generator using IP address
          const forwarded = req.headers?.get('x-forwarded-for');
          const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
          return ip;
        } catch (error) {
          console.warn('Rate limit key generation failed:', error);
          return 'unknown';
        }
      },
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check if request is within rate limit
   */
  async check(req: Request): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up expired entries
    this.cleanup(windowStart);

    const current = store.get(key);

    if (!current) {
      // First request in window
      store.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (current.resetTime < windowStart) {
      // Window has expired, reset
      store.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (current.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      };
    }

    // Increment counter
    current.count++;
    store.set(key, current);

    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(windowStart: number): void {
    for (const [key, value] of store.entries()) {
      if (value.resetTime < windowStart) {
        store.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    store.delete(key);
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(key: string): RateLimitResult | null {
    const current = store.get(key);
    if (!current) {
      return null;
    }

    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (current.resetTime < windowStart) {
      return null; // Window has expired
    }

    return {
      success: current.count < this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - current.count),
      resetTime: current.resetTime,
      retryAfter: current.count >= this.config.maxRequests 
        ? Math.ceil((current.resetTime - now) / 1000) 
        : undefined,
    };
  }
}

// Pre-configured rate limiters
export const apiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 uploads per hour
});

// Middleware function for API routes
export async function withRateLimit(
  req: Request,
  rateLimiter: RateLimiter = apiRateLimit
): Promise<{ success: boolean; result?: RateLimitResult; error?: string }> {
  try {
    const result = await rateLimiter.check(req);
    
    if (!result.success) {
      return {
        success: false,
        result,
        error: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      };
    }

    return { success: true, result };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return {
      success: false,
      error: 'Rate limiting service unavailable',
    };
  }
}

// Utility function to add rate limit headers to response
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Memory-based rate limiter for development
export class MemoryRateLimiter extends RateLimiter {
  private static instance: MemoryRateLimiter;

  static getInstance(): MemoryRateLimiter {
    if (!MemoryRateLimiter.instance) {
      MemoryRateLimiter.instance = new MemoryRateLimiter({
        windowMs: 15 * 60 * 1000,
        maxRequests: 1000,
      });
    }
    return MemoryRateLimiter.instance;
  }
}

// Redis-based rate limiter (for production)
export class RedisRateLimiter extends RateLimiter {
  private redis: any; // Redis client

  constructor(config: RateLimitConfig, redisClient: any) {
    super(config);
    this.redis = redisClient;
  }

  async check(req: Request): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Use Redis for distributed rate limiting
      const pipeline = this.redis.pipeline();
      
      // Clean up expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results[1][1] as number;

      if (currentCount >= this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime: now + this.config.windowMs,
          retryAfter: Math.ceil(this.config.windowMs / 1000),
        };
      }

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - currentCount - 1,
        resetTime: now + this.config.windowMs,
      };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fallback to allowing the request
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }
}

export default RateLimiter;

// Export named function for backward compatibility
export const rateLimit = withRateLimit;