import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, checkoutSchema } from '@/lib/validation'
import {
  secureResponse,
  securityErrorResponse,
  getClientIdentifier,
  rateLimit,
} from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await rateLimit(request, identifier, 5, 60) // 5 requests per minute
    if (!rateLimitResult.success) {
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

    // In production, you would:
    // 1. Create order in database
    // 2. Generate order ID
    // 3. Process payment based on method
    // 4. Send confirmation email
    // 5. For e-wallets, generate payment URL

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Mock payment URL generation for e-wallets
    let paymentUrl: string | null = null
    if (body.paymentMethod === 'momo') {
      // In production, integrate with MoMo API
      paymentUrl = `https://payment.momo.vn/gateway?orderId=${orderId}&amount=${body.totalPrice}`
    } else if (body.paymentMethod === 'zalopay') {
      // In production, integrate with ZaloPay API
      paymentUrl = `https://zalopay.vn/payment?orderId=${orderId}&amount=${body.totalPrice}`
    }

    // For COD, bank transfer, or card, no payment URL needed
    // They will be processed separately

    // Save order to database (mock)
    const order = {
      id: orderId,
      ...body,
      status: body.paymentMethod === 'cod' ? 'pending' : 'payment_pending',
      createdAt: new Date().toISOString(),
    }

    // In production, save to database:
    // await db.orders.create(order)

    // Send confirmation email (mock)
    // await sendEmail({
    //   to: body.email || body.phone,
    //   subject: 'Xác nhận đơn hàng',
    //   template: 'order-confirmation',
    //   data: order,
    // })

    return secureResponse({
      success: true,
      orderId,
      paymentUrl,
      message: 'Order created successfully',
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return securityErrorResponse('Failed to process checkout', 500, { error: error.message })
  }
}
