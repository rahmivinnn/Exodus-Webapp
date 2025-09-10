interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}

interface RateLimitInfo {
  limit: number
  current: number
  remaining: number
  resetTime: Date
}

class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  get(key: string): RateLimitInfo | null {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record) {
      return null
    }

    if (now > record.resetTime) {
      this.store.delete(key)
      return null
    }

    return {
      limit: 100, // Default limit
      current: record.count,
      remaining: Math.max(0, 100 - record.count),
      resetTime: new Date(record.resetTime)
    }
  }

  set(key: string, count: number, windowMs: number): void {
    const resetTime = Date.now() + windowMs
    this.store.set(key, { count, resetTime })
  }

  increment(key: string, windowMs: number): RateLimitInfo {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || now > record.resetTime) {
      this.set(key, 1, windowMs)
      return {
        limit: 100,
        current: 1,
        remaining: 99,
        resetTime: new Date(now + windowMs)
      }
    }

    const newCount = record.count + 1
    this.set(key, newCount, windowMs)
    
    return {
      limit: 100,
      current: newCount,
      remaining: Math.max(0, 100 - newCount),
      resetTime: new Date(record.resetTime)
    }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const store = new RateLimitStore()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  store.cleanup()
}, 5 * 60 * 1000)

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests' } = options

  return (req: any, res: any, next?: any) => {
    const key = req.ip || 'unknown'
    const info = store.increment(key, windowMs)

    if (info.current > max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((info.resetTime.getTime() - Date.now()) / 1000)
      })
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', info.limit)
    res.setHeader('X-RateLimit-Remaining', info.remaining)
    res.setHeader('X-RateLimit-Reset', info.resetTime.getTime())

    if (next) {
      next()
    }
  }
}

export default rateLimit