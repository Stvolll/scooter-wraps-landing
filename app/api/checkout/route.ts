import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, checkoutSchema } from '@/lib/validation'
import {
  secureResponse,
  securityErrorResponse,
  getClientIdentifier,
  rateLimit,
  logSecurityEvent,
} from '@/lib/security'
import { validateCSRFRequest } from '@/lib/csrf'
import { prisma } from '@/lib/prisma'
import { createMoMoPayment } from '@/lib/payment/momo'
import { createZaloPayPayment } from '@/lib/payment/zalopay'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    const csrfValid = await validateCSRFRequest(request)
    if (!csrfValid) {
      logSecurityEvent('csrf_failed', {
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
        path: request.url,
      })
      return securityErrorResponse('Invalid CSRF token', 403, {
        identifier: getClientIdentifier(request),
      })
    }

    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await rateLimit(request, identifier, 5, 60) // 5 requests per minute
    if (!rateLimitResult.success) {
      logSecurityEvent('rate_limit_exceeded', {
        identifier,
        ip: request.ip,
        path: request.url,
      })
      return securityErrorResponse('Too many requests. Please try again later.', 429, {
        identifier,
      })
    }

    // Validate request
    const validation = await validateRequest(request, checkoutSchema)
    if (!validation.success) {
      return securityErrorResponse(validation.error, validation.status)
    }

    const body = validation.data

    // Validate required fields
    if (!body.designId || !body.paymentMethod || !body.name || !body.phone || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify design exists and is available
    const design = await prisma.design.findUnique({
      where: { id: body.designId },
      select: { id: true, title: true, price: true, editionAvailable: true, status: true },
    })

    if (!design) {
      return NextResponse.json({ success: false, error: 'Design not found' }, { status: 404 })
    }

    if (design.editionAvailable <= 0) {
      return NextResponse.json(
        { success: false, error: 'Design is out of stock' },
        { status: 400 }
      )
    }

    // Validate and apply promo code if provided
    let discountAmount = 0
    let promoCodeId: string | null = null
    if (body.promoCode) {
      try {
        const promoResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/promo-codes?code=${encodeURIComponent(body.promoCode)}&totalAmount=${body.totalPrice || design.price}`
        )
        const promoData = await promoResponse.json()
        if (promoData.success) {
          discountAmount = promoData.promoCode.discountAmount || 0
          promoCodeId = promoData.promoCode.id
        }
      } catch (error: any) {
        console.error('Promo code validation error:', error)
        // Continue without promo code if validation fails
      }
    }

    const finalPrice = (body.totalPrice || design.price) - discountAmount

    // Generate order ID
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substr(2, 9)
    const orderId = `ORD-${timestamp}-${randomStr}`

    // Determine order status based on payment method
    const status =
      body.paymentMethod === 'cod'
        ? 'pending'
        : ['bank_transfer', 'bank'].includes(body.paymentMethod)
          ? 'payment_pending'
          : 'payment_pending'

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderId,
        designId: body.designId,
        buyerName: body.name,
        buyerEmail: body.email || null,
        buyerPhone: body.phone,
        address: body.address,
        paymentMethod: body.paymentMethod,
        totalPrice: finalPrice,
        discountAmount,
        promoCodeId,
        status,
      },
    })

    // Process payment based on method
    let paymentUrl: string | null = null
    let paymentData: any = null

    if (body.paymentMethod === 'momo') {
      try {
        const momoConfig = {
          partnerCode: process.env.MOMO_PARTNER_CODE || '',
          accessKey: process.env.MOMO_ACCESS_KEY || '',
          secretKey: process.env.MOMO_SECRET_KEY || '',
          environment: (process.env.MOMO_ENV || 'sandbox') as 'sandbox' | 'production',
        }

        if (momoConfig.partnerCode && momoConfig.accessKey && momoConfig.secretKey) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          const momoResponse = await createMoMoPayment(momoConfig, {
            orderId: order.orderId,
            amount: finalPrice,
            orderInfo: `Order ${order.orderId} - ${design.title}`,
            returnUrl: `${baseUrl}/payment/return?orderId=${order.orderId}`,
            notifyUrl: `${baseUrl}/api/payment/momo/webhook`,
          })

          if (momoResponse.errorCode === 0 && momoResponse.payUrl) {
            paymentUrl = momoResponse.payUrl
            paymentData = { qrCodeUrl: momoResponse.qrCodeUrl, deeplink: momoResponse.deeplink }
          }
        }
      } catch (error: any) {
        console.error('MoMo payment creation error:', error)
        // Continue without payment URL - order is still created
      }
    } else if (body.paymentMethod === 'zalopay') {
      try {
        const zalopayConfig = {
          appId: process.env.ZALOPAY_APP_ID || '',
          key1: process.env.ZALOPAY_KEY1 || '',
          key2: process.env.ZALOPAY_KEY2 || '',
          environment: (process.env.ZALOPAY_ENV || 'sandbox') as 'sandbox' | 'production',
        }

        if (zalopayConfig.appId && zalopayConfig.key1 && zalopayConfig.key2) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          const appTransId = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}_${zalopayConfig.appId}_${timestamp}`
          const zalopayResponse = await createZaloPayPayment(zalopayConfig, {
            appUser: body.phone,
            amount: finalPrice,
            appTransId,
            appTime: timestamp,
            item: JSON.stringify([{ name: design.title, quantity: 1, price: order.totalPrice }]),
            description: `Order ${order.orderId} - ${design.title}`,
            callbackUrl: `${baseUrl}/api/payment/zalopay/webhook`,
          })

          if (zalopayResponse.returnCode === 1 && zalopayResponse.orderUrl) {
            paymentUrl = zalopayResponse.orderUrl
            paymentData = { qrCode: zalopayResponse.qrCode, zpTransToken: zalopayResponse.zpTransToken }
          }
        }
      } catch (error: any) {
        console.error('ZaloPay payment creation error:', error)
        // Continue without payment URL - order is still created
      }
    }

    // Update order with payment URL if available
    if (paymentUrl) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentUrl },
      })
    }

    // Send confirmation email
    if (order.buyerEmail) {
      try {
        const { sendEmail, emailTemplates } = await import('@/lib/email')
        const template = emailTemplates.orderConfirmation({
          orderId: order.orderId,
          buyerName: order.buyerName,
          designTitle: design.title,
          totalPrice: order.totalPrice,
          paymentMethod: order.paymentMethod,
        })
        await sendEmail({
          to: order.buyerEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
      } catch (error: any) {
        console.error('Failed to send confirmation email:', error)
        // Don't fail the order creation if email fails
      }
    }

    return secureResponse({
      success: true,
      orderId: order.orderId,
      paymentUrl,
      paymentData,
      message: 'Order created successfully',
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return securityErrorResponse('Failed to process checkout', 500, { error: error.message })
  }
}
