/**
 * Simple in-memory rate limiting utility
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingTime: number } {
  const allowed = rateLimiter.isAllowed(identifier, limit, windowMs);
  const remainingTime = rateLimiter.getRemainingTime(identifier);

  return { allowed, remainingTime };
}

export function getRateLimitHeaders(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000
): Record<string, string> {
  const { allowed, remainingTime } = checkRateLimit(identifier, limit, windowMs);
  
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': allowed ? (limit - 1).toString() : '0',
    'X-RateLimit-Reset': new Date(Date.now() + remainingTime).toISOString(),
  };
}

export { rateLimiter as rateLimit };
export default rateLimiter;