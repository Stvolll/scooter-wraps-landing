/**
 * CSRF Protection
 * Generates and validates CSRF tokens for state-changing operations
 */

import { cookies } from 'next/headers'
import { randomBytes, createHmac } from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf_token'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 2 // 2 hours

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex')
  const timestamp = Date.now()
  const data = `${token}:${timestamp}`
  
  // Create HMAC signature
  const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
  const signature = createHmac('sha256', secret).update(data).digest('hex')
  
  return `${token}:${timestamp}:${signature}`
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const parts = token.split(':')
    if (parts.length !== 3) return false
    
    const [tokenPart, timestamp, signature] = parts
    const data = `${tokenPart}:${timestamp}`
    
    // Check expiry
    const tokenAge = Date.now() - parseInt(timestamp, 10)
    if (tokenAge > CSRF_TOKEN_EXPIRY * 1000) return false
    
    // Verify signature
    const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
    const calculatedSignature = createHmac('sha256', secret).update(data).digest('hex')
    
    return calculatedSignature === signature
  } catch {
    return false
  }
}

/**
 * Get or create CSRF token for current session
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value
  
  if (existingToken && validateCSRFToken(existingToken)) {
    return existingToken
  }
  
  // Generate new token
  const newToken = generateCSRFToken()
  cookieStore.set(CSRF_TOKEN_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  })
  
  return newToken
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFRequest(request: Request): Promise<boolean> {
  // Skip CSRF for GET requests
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true
  }
  
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value
  
  if (!cookieToken) {
    return false
  }
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)
  
  if (!headerToken) {
    return false
  }
  
  // Tokens must match
  if (cookieToken !== headerToken) {
    return false
  }
  
  // Validate token format and signature
  return validateCSRFToken(headerToken)
}





