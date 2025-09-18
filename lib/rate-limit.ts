import { NextRequest } from 'next/server'

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  message?: string
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private options: RateLimitOptions

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      ...options,
    }
  }

  private getKey(request: NextRequest): string {
    // Use IP address as the key for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return ip
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  check(request: NextRequest): RateLimitResult {
    this.cleanup()
    
    const key = this.getKey(request)
    const now = Date.now()
    const windowMs = this.options.windowMs
    const max = this.options.max

    const current = this.requests.get(key)
    
    if (!current) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      
      return {
        success: true,
        limit: max,
        remaining: max - 1,
        reset: now + windowMs,
      }
    }

    if (now > current.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      
      return {
        success: true,
        limit: max,
        remaining: max - 1,
        reset: now + windowMs,
      }
    }

    if (current.count >= max) {
      return {
        success: false,
        limit: max,
        remaining: 0,
        reset: current.resetTime,
        message: this.options.message,
      }
    }

    current.count++
    this.requests.set(key, current)

    return {
      success: true,
      limit: max,
      remaining: max - current.count,
      reset: current.resetTime,
    }
  }
}

// Create a default rate limiter instance
const defaultRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

export function rateLimit(options?: Partial<RateLimitOptions>) {
  if (options) {
    return new RateLimiter({ ...defaultRateLimiter['options'], ...options })
  }
  return defaultRateLimiter
}

export { RateLimiter }
export type { RateLimitOptions, RateLimitResult }