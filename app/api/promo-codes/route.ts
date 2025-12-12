/**
 * Promo Codes API
 * Handles promo code validation and application
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/validation'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const validatePromoCodeSchema = z.object({
  code: z.string().min(1).max(50),
  totalAmount: z.number().positive().optional(),
})

/**
 * GET /api/promo-codes?code=XXX
 * Validate a promo code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const totalAmount = searchParams.get('totalAmount')

    if (!code) {
      return NextResponse.json({ success: false, error: 'Promo code required' }, { status: 400 })
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode) {
      return NextResponse.json({ success: false, error: 'Invalid promo code' }, { status: 404 })
    }

    // Check if active
    if (!promoCode.active) {
      return NextResponse.json({ success: false, error: 'Promo code is not active' }, { status: 400 })
    }

    // Check validity dates
    const now = new Date()
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return NextResponse.json({ success: false, error: 'Promo code has expired' }, { status: 400 })
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return NextResponse.json({ success: false, error: 'Promo code usage limit reached' }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (totalAmount) {
      const amount = parseFloat(totalAmount.toString())
      
      // Check minimum purchase
      if (promoCode.minPurchase && amount < promoCode.minPurchase) {
        return NextResponse.json({
          success: false,
          error: `Minimum purchase of ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promoCode.minPurchase)} required`,
        }, { status: 400 })
      }

      // Calculate discount
      if (promoCode.discountType === 'percentage') {
        discountAmount = Math.floor((amount * promoCode.discountValue) / 100)
        if (promoCode.maxDiscount) {
          discountAmount = Math.min(discountAmount, promoCode.maxDiscount)
        }
      } else {
        discountAmount = promoCode.discountValue
      }
    }

    return NextResponse.json({
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        minPurchase: promoCode.minPurchase,
      },
    })
  } catch (error: any) {
    console.error('Promo code validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/promo-codes
 * Apply promo code to order (increments usage count)
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequest(request, validatePromoCodeSchema)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: validation.status })
    }

    const { code, totalAmount } = validation.data

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode || !promoCode.active) {
      return NextResponse.json({ success: false, error: 'Invalid promo code' }, { status: 404 })
    }

    // Check validity and limits
    const now = new Date()
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return NextResponse.json({ success: false, error: 'Promo code has expired' }, { status: 400 })
    }

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return NextResponse.json({ success: false, error: 'Promo code usage limit reached' }, { status: 400 })
    }

    // Increment usage count (will be finalized when order is created)
    await prisma.promoCode.update({
      where: { id: promoCode.id },
      data: { usedCount: { increment: 1 } },
    })

    // Calculate discount
    let discountAmount = 0
    if (totalAmount) {
      if (promoCode.discountType === 'percentage') {
        discountAmount = Math.floor((totalAmount * promoCode.discountValue) / 100)
        if (promoCode.maxDiscount) {
          discountAmount = Math.min(discountAmount, promoCode.maxDiscount)
        }
      } else {
        discountAmount = promoCode.discountValue
      }
    }

    return NextResponse.json({
      success: true,
      discountAmount,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
      },
    })
  } catch (error: any) {
    console.error('Promo code application error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to apply promo code' },
      { status: 500 }
    )
  }
}



