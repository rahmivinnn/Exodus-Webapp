import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(limit: number = 10, windowMs: number = 60000) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }

    const current = rateLimitMap.get(ip)
    
    if (!current) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
      return { success: true, remaining: limit - 1 }
    }

    if (current.resetTime < now) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
      return { success: true, remaining: limit - 1 }
    }

    if (current.count >= limit) {
      return { success: false, remaining: 0 }
    }

    current.count++
    return { success: true, remaining: limit - current.count }
  }
}