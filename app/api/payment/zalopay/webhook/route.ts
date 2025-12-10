/**
 * ZaloPay Payment Webhook Handler
 * Handles payment callbacks from ZaloPay gateway
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyZaloPayCallback } from '@/lib/payment/zalopay'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature
    const zalopayConfig = {
      appId: process.env.ZALOPAY_APP_ID || '',
      key1: process.env.ZALOPAY_KEY1 || '',
      key2: process.env.ZALOPAY_KEY2 || '',
      environment: (process.env.ZALOPAY_ENV || 'sandbox') as 'sandbox' | 'production',
    }

    if (!verifyZaloPayCallback(zalopayConfig, body)) {
      console.error('[ZALOPAY WEBHOOK] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { app_trans_id, zp_trans_id, amount, return_code, return_message } = body

    // Extract orderId from app_trans_id (format: YYMMDD_appid_timestamp)
    // We need to find order by matching the timestamp part
    const orders = await prisma.order.findMany({
      where: {
        orderId: {
          contains: app_trans_id.split('_').pop()?.substring(0, 10) || '',
        },
      },
      include: { design: true },
      take: 1,
    })

    const order = orders[0]

    if (!order) {
      console.error('[ZALOPAY WEBHOOK] Order not found:', app_trans_id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Process payment result
    if (return_code === 1) {
      // Payment successful
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paymentId: zp_trans_id,
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

      console.log('[ZALOPAY WEBHOOK] Payment confirmed:', order.orderId, zp_trans_id)

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
          notes: `Payment failed: ${return_message}`,
        },
      })

      console.warn('[ZALOPAY WEBHOOK] Payment failed:', order.orderId, return_message)
    }

    return NextResponse.json({ return_code: 1, return_message: 'Success' })
  } catch (error: any) {
    console.error('[ZALOPAY WEBHOOK] Error:', error)
    return NextResponse.json({ return_code: -1, return_message: 'Error' }, { status: 500 })
  }
}

