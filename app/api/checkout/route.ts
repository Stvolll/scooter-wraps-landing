import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface CheckoutRequest {
  designId: string
  paymentMethod: 'cod' | 'momo' | 'zalopay' | 'bank' | 'card'
  deliveryOption: 'shipping' | 'shipping-install'
  name: string
  phone: string
  email?: string
  address: string
  totalPrice: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()

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

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl,
      message: 'Order created successfully',
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
