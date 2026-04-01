/**
 * Edge-safe rate limiting for middleware only.
 * Keep free of Node-only APIs (require('crypto'), process.versions, Buffer).
 */

import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/** Tier limits: max requests per window (seconds). Tuned for normal SPA + strict abuse protection. */
export const RATE_LIMIT_TIERS = {
  /** Read-heavy public APIs */
  relaxed: { limit: 100, windowSec: 10 },
  /** Most /api/* routes */
  default: { limit: 80, windowSec: 10 },
  /** Checkout & booking */
  strict: { limit: 5, windowSec: 60 },
  /** File upload endpoints */
  uploads: { limit: 25, windowSec: 60 },
  /** Admin API (auth still required on routes) */
  admin: { limit: 25, windowSec: 60 },
} as const

export type RateLimitTier = keyof typeof RATE_LIMIT_TIERS

let redis: Redis | null = null
const upstashLimiters: Partial<Record<RateLimitTier, Ratelimit>> = {}

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    ;(Object.keys(RATE_LIMIT_TIERS) as RateLimitTier[]).forEach(tier => {
      const cfg = RATE_LIMIT_TIERS[tier]
      upstashLimiters[tier] = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(cfg.limit, `${cfg.windowSec} s`),
        analytics: true,
        prefix: `ratelimit:${tier}`,
      })
    })
  }
} catch {
  console.warn('[rate-limit] Upstash init failed; using in-memory fallback.')
}

const memoryStore = new Map<string, { count: number; resetTime: number }>()

export function resolveRateLimitTier(pathname: string): RateLimitTier {
  if (
    pathname.startsWith('/api/scooters') ||
    pathname === '/api/gallery' ||
    pathname.startsWith('/api/gallery/') ||
    pathname === '/api/testimonials' ||
    pathname.startsWith('/api/testimonials/')
  ) {
    return 'relaxed'
  }
  if (pathname.includes('/checkout') || pathname.includes('/book-installation')) {
    return 'strict'
  }
  if (pathname.includes('/admin')) {
    return 'admin'
  }
  if (pathname.includes('/uploads')) {
    return 'uploads'
  }
  return 'default'
}

export async function rateLimit(
  _request: NextRequest,
  identifier: string,
  tier: RateLimitTier
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const cfg = RATE_LIMIT_TIERS[tier]
  const limiter = upstashLimiters[tier]

  if (limiter) {
    const result = await limiter.limit(identifier)
    return {
      success: result.success,
      limit: cfg.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  const now = Date.now()
  const windowMs = cfg.windowSec * 1000
  const key = `${tier}:${identifier}:${Math.floor(now / windowMs)}`
  const record = memoryStore.get(key)

  if (!record || record.resetTime < now) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, limit: cfg.limit, remaining: cfg.limit - 1, reset: now + windowMs }
  }

  if (record.count >= cfg.limit) {
    return { success: false, limit: cfg.limit, remaining: 0, reset: record.resetTime }
  }

  record.count++
  return {
    success: true,
    limit: cfg.limit,
    remaining: cfg.limit - record.count,
    reset: record.resetTime,
  }
}

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.substring(0, 50)}`
}
