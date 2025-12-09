/**
 * Bybit API Security Utilities
 * Handles HMAC signature verification, webhook validation, and secure API calls
 * Uses Web Crypto API for Edge Runtime compatibility
 */

import { NextRequest } from 'next/server'
import { verifyHMACSignature, verifyHMACSignatureSync } from './security'

const BYBIT_API_KEY = process.env.BYBIT_API_KEY || ''
const BYBIT_API_SECRET = process.env.BYBIT_API_SECRET || ''
const BYBIT_WEBHOOK_SECRET = process.env.BYBIT_WEBHOOK_SECRET || ''

/**
 * Generate Bybit API signature for authenticated requests
 * Bybit uses HMAC-SHA256 with specific format
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export async function generateBybitSignature(
  params: Record<string, any>,
  secret: string = BYBIT_API_SECRET
): Promise<string> {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  // Use Web Crypto API
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(sortedParams))
  const signatureArray = new Uint8Array(signatureBuffer)
  return Array.from(signatureArray, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Synchronous version using Node.js crypto (for non-Edge contexts)
 */
export function generateBybitSignatureSync(
  params: Record<string, any>,
  secret: string = BYBIT_API_SECRET
): string {
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const nodeCrypto = require('crypto')
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&')
      const hmac = nodeCrypto.createHmac('sha256', secret)
      hmac.update(sortedParams)
      return hmac.digest('hex')
    } catch (error) {
      console.error('Bybit signature generation error:', error)
      throw error
    }
  }
  throw new Error('Node.js crypto not available. Use async version.')
}

/**
 * Verify Bybit webhook signature
 * Bybit sends webhooks with X-BAPI-SIGN header
 * Async version for Edge Runtime compatibility
 */
export async function verifyBybitWebhook(request: NextRequest): Promise<boolean> {
  try {
    const signature = request.headers.get('X-BAPI-SIGN')
    const timestamp = request.headers.get('X-BAPI-TIMESTAMP')
    const recvWindow = request.headers.get('X-BAPI-RECV-WINDOW')

    if (!signature || !timestamp) {
      return false
    }

    // Get raw body (need to clone request to read body)
    // In production, you should store the raw body before parsing
    const body = request.headers.get('X-BAPI-BODY') || ''

    // Bybit signature format: HMAC-SHA256(timestamp + recvWindow + body)
    const payload = `${timestamp}${recvWindow || ''}${body}`

    return await verifyHMACSignature(
      payload,
      signature,
      BYBIT_WEBHOOK_SECRET || BYBIT_API_SECRET,
      'SHA-256'
    )
  } catch (error) {
    console.error('Bybit webhook verification error:', error)
    return false
  }
}

/**
 * Synchronous version for non-Edge contexts (API routes)
 */
export function verifyBybitWebhookSync(request: NextRequest): boolean {
  try {
    const signature = request.headers.get('X-BAPI-SIGN')
    const timestamp = request.headers.get('X-BAPI-TIMESTAMP')
    const recvWindow = request.headers.get('X-BAPI-RECV-WINDOW')

    if (!signature || !timestamp) {
      return false
    }

    const body = request.headers.get('X-BAPI-BODY') || ''
    const payload = `${timestamp}${recvWindow || ''}${body}`

    return verifyHMACSignatureSync(
      payload,
      signature,
      BYBIT_WEBHOOK_SECRET || BYBIT_API_SECRET,
      'sha256'
    )
  } catch (error) {
    console.error('Bybit webhook verification error:', error)
    return false
  }
}

/**
 * Create authenticated Bybit API request headers
 * Async version for Edge Runtime compatibility
 */
export async function createBybitHeaders(
  params: Record<string, any>,
  recvWindow: number = 5000
): Promise<Record<string, string>> {
  const timestamp = Date.now().toString()
  const signature = await generateBybitSignature({ ...params, timestamp, recvWindow })

  return {
    'X-BAPI-API-KEY': BYBIT_API_KEY,
    'X-BAPI-SIGN': signature,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-RECV-WINDOW': recvWindow.toString(),
    'Content-Type': 'application/json',
  }
}

/**
 * Synchronous version for non-Edge contexts (API routes)
 */
export function createBybitHeadersSync(
  params: Record<string, any>,
  recvWindow: number = 5000
): Record<string, string> {
  const timestamp = Date.now().toString()
  const signature = generateBybitSignatureSync({ ...params, timestamp, recvWindow })

  return {
    'X-BAPI-API-KEY': BYBIT_API_KEY,
    'X-BAPI-SIGN': signature,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-RECV-WINDOW': recvWindow.toString(),
    'Content-Type': 'application/json',
  }
}

/**
 * Validate Bybit API response
 */
export function validateBybitResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false
  }

  // Check for error codes
  if (response.retCode !== 0 && response.retCode !== undefined) {
    console.error('Bybit API error:', response.retMsg || 'Unknown error')
    return false
  }

  return true
}

/**
 * Secure Bybit webhook handler wrapper
 */
export async function handleBybitWebhook(
  request: NextRequest,
  handler: (payload: any) => Promise<any>
): Promise<Response> {
  // Verify webhook signature (use sync version in API routes)
  if (!verifyBybitWebhookSync(request)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid webhook signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await request.json()
    const result = await handler(payload)
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Bybit webhook handler error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Webhook processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
