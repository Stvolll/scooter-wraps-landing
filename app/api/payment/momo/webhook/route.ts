/**
 * MoMo Payment Webhook Handler
 * Handles payment callbacks from MoMo gateway
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMoMoSignature } from '@/lib/payment/momo'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature
    const momoConfig = {
      partnerCode: process.env.MOMO_PARTNER_CODE || '',
      accessKey: process.env.MOMO_ACCESS_KEY || '',
      secretKey: process.env.MOMO_SECRET_KEY || '',
      environment: (process.env.MOMO_ENV || 'sandbox') as 'sandbox' | 'production',
    }

    if (!verifyMoMoSignature(momoConfig, body)) {
      console.error('[MOMO WEBHOOK] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { orderId, resultCode, amount, transId, message } = body

    // Find order by orderId
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { design: true },
    })

    if (!order) {
      console.error('[MOMO WEBHOOK] Order not found:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Process payment result
    if (resultCode === 0) {
      // Payment successful
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paymentId: transId,
            paymentConfirmedAt: new Date(),
          },
        }),
        prisma.design.update({
          where: { id: order.designId },
          data: {
            editionAvailable: { decrement: 1 },
          },
        }),
        // Create deal for tracking
        prisma.deal.create({
          data: {
            designId: order.designId,
            buyerName: order.buyerName,
            buyerEmail: order.buyerEmail,
            status: 'paid',
          },
        }),
      ])

      console.log('[MOMO WEBHOOK] Payment confirmed:', orderId, transId)

      // Send payment confirmation email
      if (order.buyerEmail) {
        try {
          const { sendEmail, emailTemplates } = await import('@/lib/email')
          const template = emailTemplates.paymentConfirmed({
            orderId: order.orderId,
            buyerName: order.buyerName,
            designTitle: order.design.title,
          })
          await sendEmail({
            to: order.buyerEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        } catch (error: any) {
          console.error('Failed to send payment confirmation email:', error)
        }
      }
    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          notes: `Payment failed: ${message}`,
        },
      })

      console.warn('[MOMO WEBHOOK] Payment failed:', orderId, message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[MOMO WEBHOOK] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

