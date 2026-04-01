/**
 * Security utilities for API routes
 * Includes rate limiting, input validation, CSRF protection, and crypto utilities
 */

import { NextResponse } from 'next/server'

/** Edge-safe rate limiting (middleware); full implementation in rate-limit.ts */
export { rateLimit, getClientIdentifier } from './rate-limit'

/**
 * Security logging
 */
export function logSecurityEvent(
  type: 'csrf_failed' | 'rate_limit_exceeded' | 'invalid_request' | 'suspicious_activity',
  details: Record<string, any>
) {
  const timestamp = new Date().toISOString()
  console.warn(`[SECURITY] ${timestamp} [${type}]`, details)
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production' && process.env.SECURITY_LOG_WEBHOOK) {
    fetch(process.env.SECURITY_LOG_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, details, timestamp }),
    }).catch(err => console.error('Failed to send security log:', err))
  }
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
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: algo }, false, [
      'sign',
    ])

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
