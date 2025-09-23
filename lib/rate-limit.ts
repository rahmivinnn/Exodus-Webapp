import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private options: Required<RateLimitOptions>

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs,
      max: options.max,
      message: options.message || 'Too many requests',
      standardHeaders: options.standardHeaders ?? true,
      legacyHeaders: options.legacyHeaders ?? false,
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
      if (value.resetTime < now) {
        this.requests.delete(key)
      }
    }
  }

  check(request: NextRequest): { allowed: boolean; info: RateLimitInfo } {
    this.cleanup()
    
    const key = this.getKey(request)
    const now = Date.now()
    const windowMs = this.options.windowMs
    const max = this.options.max

    const current = this.requests.get(key)
    
    if (!current) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        allowed: true,
        info: {
          limit: max,
          remaining: max - 1,
          reset: now + windowMs
        }
      }
    }

    if (current.resetTime < now) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        allowed: true,
        info: {
          limit: max,
          remaining: max - 1,
          reset: now + windowMs
        }
      }
    }

    if (current.count >= max) {
      return {
        allowed: false,
        info: {
          limit: max,
          remaining: 0,
          reset: current.resetTime
        }
      }
    }

    // Increment count
    current.count++
    this.requests.set(key, current)

    return {
      allowed: true,
      info: {
        limit: max,
        remaining: max - current.count,
        reset: current.resetTime
      }
    }
  }

  middleware() {
    return (request: NextRequest) => {
      const { allowed, info } = this.check(request)

      if (!allowed) {
        const response = NextResponse.json(
          { error: this.options.message },
          { status: 429 }
        )

        if (this.options.standardHeaders) {
          response.headers.set('RateLimit-Limit', info.limit.toString())
          response.headers.set('RateLimit-Remaining', info.remaining.toString())
          response.headers.set('RateLimit-Reset', new Date(info.reset).toISOString())
        }

        if (this.options.legacyHeaders) {
          response.headers.set('X-RateLimit-Limit', info.limit.toString())
          response.headers.set('X-RateLimit-Remaining', info.remaining.toString())
          response.headers.set('X-RateLimit-Reset', info.reset.toString())
        }

        return response
      }

      return NextResponse.next()
    }
  }
}

// Create rate limiter instances
export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

export const strictRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Rate limit exceeded. Please try again later.',
})

export { RateLimiter }
export type { RateLimitOptions, RateLimitInfo }
