/**
 * Node.js-only security helpers. Do not import from middleware (Edge).
 */

import { createHmac, timingSafeEqual } from 'crypto'

export function verifyHMACSignatureSync(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    const hmac = createHmac(algorithm, secret)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error('HMAC verification error (Node.js):', error)
    return false
  }
}
