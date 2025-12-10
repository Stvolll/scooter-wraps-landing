/**
 * Input validation and sanitization using Zod
 * Provides type-safe validation for API endpoints
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { sanitizeInput, isValidEmail, isValidPhone } from './security'

/**
 * Common validation schemas
 */
export const emailSchema = z.string().email().transform(sanitizeInput)
export const phoneSchema = z
  .string()
  .refine(isValidPhone, {
    message: 'Invalid phone number format',
  })
  .transform(sanitizeInput)
export const nameSchema = z.string().min(1).max(100).transform(sanitizeInput)
export const addressSchema = z.string().min(5).max(500).transform(sanitizeInput)

/**
 * Checkout request validation
 */
export const checkoutSchema = z.object({
  designId: z.string().min(1),
  paymentMethod: z.enum(['cod', 'momo', 'zalopay', 'bank', 'card', 'crypto']),
  deliveryOption: z.enum(['shipping', 'shipping-install']),
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  address: addressSchema,
  totalPrice: z.number().positive().max(1000000), // Max 1M
  cryptoAddress: z.string().optional(), // For crypto payments
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT', 'USDC']).optional(),
  promoCode: z.string().optional(), // Promo code
})

/**
 * Booking request validation
 */
export const bookingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  scooterModel: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  workshopId: z.string().min(1),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  notes: z
    .string()
    .max(1000)
    .optional()
    .transform(val => (val ? sanitizeInput(val) : undefined)),
})

/**
 * Bybit payment request validation
 */
export const bybitPaymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['BTC', 'ETH', 'USDT', 'USDC']),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

/**
 * Validate request body with schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
  try {
    const body = await request.json()
    const validated = schema.parse(body)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        status: 400,
      }
    }
    return {
      success: false,
      error: 'Invalid request body',
      status: 400,
    }
  }
}
