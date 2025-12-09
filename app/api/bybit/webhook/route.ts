/**
 * Bybit Webhook Handler
 * Securely handles webhook callbacks from Bybit API
 * Validates HMAC signatures and processes payment confirmations
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyBybitWebhookSync } from '@/lib/bybit-security'
import { prisma } from '@/lib/prisma'
import { secureResponse, securityErrorResponse } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Verify webhook signature (use sync version in API routes)
  if (!verifyBybitWebhookSync(request)) {
    return securityErrorResponse('Invalid webhook signature', 401, {
      ip: request.ip,
      headers: Object.fromEntries(request.headers.entries()),
    })
  }

  try {
    const payload = await request.json()

    // Handle different webhook event types
    switch (payload.eventType) {
      case 'payment.success':
        // Process successful payment
        if (payload.orderId) {
          // Update order status in database
          // await prisma.order.update({
          //   where: { id: payload.orderId },
          //   data: { status: 'paid', paymentConfirmedAt: new Date() },
          // })

          // Log payment confirmation
          console.log('[BYBIT] Payment confirmed:', payload.orderId, payload.amount)
        }
        break

      case 'payment.failed':
        // Handle failed payment
        console.warn('[BYBIT] Payment failed:', payload.orderId, payload.reason)
        break

      case 'withdrawal.success':
        // Handle successful withdrawal
        console.log('[BYBIT] Withdrawal successful:', payload.withdrawalId)
        break

      default:
        console.log('[BYBIT] Unknown event type:', payload.eventType)
    }

    return secureResponse({ success: true, message: 'Webhook processed' })
  } catch (error: any) {
    console.error('Bybit webhook processing error:', error)
    return securityErrorResponse('Webhook processing failed', 500, { error: error.message })
  }
}
