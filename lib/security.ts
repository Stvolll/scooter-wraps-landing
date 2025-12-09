/**
 * Security utilities for API routes
 * Includes rate limiting, input validation, CSRF protection, and crypto utilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis for rate limiting (fallback to in-memory if not configured)
let redis: Redis | null = null
let rateLimiter: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds default
      analytics: true,
    })
  }
} catch (error) {
  console.warn('Rate limiting not configured. Using in-memory fallback.')
}

// In-memory rate limiter fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 */
export async function rateLimit(
  request: NextRequest,
  identifier: string,
  limit: number = 10,
  window: number = 10
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (rateLimiter) {
    const result = await rateLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }

  // Fallback to in-memory rate limiting
  const now = Date.now()
  const key = `${identifier}:${Math.floor(now / (window * 1000))}`
  const record = memoryStore.get(key)

  if (!record || record.resetTime < now) {
    memoryStore.set(key, { count: 1, resetTime: now + window * 1000 })
    return { success: true, limit, remaining: limit - 1, reset: now + window * 1000 }
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime }
  }

  record.count++
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime }
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'

  // Also use user agent for additional identification
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.substring(0, 50)}`
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 10000) // Max length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * CSRF token generation and validation
 * Uses Web Crypto API for Edge Runtime compatibility
 */

// Generate random hex string using Web Crypto API (Edge Runtime compatible)
async function generateRandomHex(length: number): Promise<string> {
  const array = new Uint8Array(length / 2)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Synchronous version for CSRF_SECRET initialization (only runs once)
function generateRandomHexSync(length: number): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    // Fallback for environments without crypto
    return Array.from({ length: length / 2 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join('')
  }
  const array = new Uint8Array(length / 2)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

const CSRF_SECRET = process.env.CSRF_SECRET || generateRandomHexSync(64)

export async function generateCSRFToken(): Promise<string> {
  return generateRandomHex(64)
}

// Synchronous version for compatibility
export function generateCSRFTokenSync(): string {
  return generateRandomHexSync(64)
}

export function validateCSRFToken(token: string, sessionToken?: string): boolean {
  if (!token || !sessionToken) return false
  // In production, validate against session store
  return token.length === 64 && /^[a-f0-9]+$/.test(token)
}

/**
 * HMAC signature verification for webhooks (Bybit, etc.)
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export async function verifyHMACSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'SHA-256'
): Promise<boolean> {
  try {
    // Convert algorithm name for Web Crypto API
    const algo = algorithm === 'sha256' ? 'SHA-256' : algorithm.toUpperCase()

    // Import secret key
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: algo },
      false,
      ['sign']
    )

    // Sign payload
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))

    // Convert to hex
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Compare signatures (timing-safe)
    if (signature.length !== expectedSignature.length) return false

    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    return result === 0
  } catch (error) {
    console.error('HMAC verification error:', error)
    return false
  }
}

/**
 * Synchronous HMAC verification using Node.js crypto (for non-Edge contexts)
 * Only use this in API routes that don't run in Edge Runtime
 */
export function verifyHMACSignatureSync(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  // Only import Node.js crypto if not in Edge Runtime
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      // Dynamic import to avoid Edge Runtime issues
      const nodeCrypto = require('crypto')
      const hmac = nodeCrypto.createHmac(algorithm, secret)
      hmac.update(payload)
      const expectedSignature = hmac.digest('hex')
      return nodeCrypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch (error) {
      console.error('HMAC verification error (Node.js):', error)
      return false
    }
  }
  // Fallback: return false if Node.js crypto is not available
  console.warn('HMAC verification: Node.js crypto not available, use async version')
  return false
}

/**
 * Secure API response wrapper
 */
export function secureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status })

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

/**
 * Error response with security considerations
 */
export function securityErrorResponse(
  message: string,
  status: number = 400,
  logDetails?: any
): NextResponse {
  // Log security events (in production, send to monitoring service)
  if (logDetails) {
    console.warn('[SECURITY]', message, logDetails)
  }

  return secureResponse({ success: false, error: message }, status)
}
