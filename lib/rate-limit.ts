interface RateLimitOptions {
  windowMs: number
  max: number
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max } = options

  return function(req: Request) {
    const key = req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      }
      return { success: true, remaining: max - 1 }
    }
    
    if (store[key].count >= max) {
      return { success: false, remaining: 0 }
    }
    
    store[key].count++
    return { success: true, remaining: max - store[key].count }
  }
}