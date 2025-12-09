import { NextRequest, NextResponse } from 'next/server'
import { parseISO, isValid } from 'date-fns'
import { validateRequest, bookingSchema } from '@/lib/validation'
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
    const validation = await validateRequest(request, bookingSchema)
    if (!validation.success) {
      return securityErrorResponse(validation.error, validation.status)
    }

    const body = validation.data

    // Validate required fields
    if (
      !body.name ||
      !body.phone ||
      !body.scooterModel ||
      !body.date ||
      !body.time ||
      !body.workshopId
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date
    const bookingDate = parseISO(body.date)
    if (!isValid(bookingDate)) {
      return NextResponse.json({ success: false, error: 'Invalid date format' }, { status: 400 })
    }

    // Check if date is in the past
    if (bookingDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Booking date cannot be in the past' },
        { status: 400 }
      )
    }

    // Validate time slot
    const validTimeSlots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ]
    if (!validTimeSlots.includes(body.time)) {
      return NextResponse.json({ success: false, error: 'Invalid time slot' }, { status: 400 })
    }

    // In production, you would:
    // 1. Check availability for the selected date/time/workshop
    // 2. Create booking in database
    // 3. Send confirmation email/SMS
    // 4. Add to calendar system

    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const booking = {
      id: bookingId,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // In production, save to database:
    // await db.bookings.create(booking)

    // Check for conflicts (mock)
    // const conflicts = await db.bookings.find({
    //   workshopId: body.workshopId,
    //   date: body.date,
    //   time: body.time,
    //   status: { $in: ['pending', 'confirmed'] }
    // })
    // if (conflicts.length > 0) {
    //   return NextResponse.json(
    //     { success: false, error: 'Time slot already booked' },
    //     { status: 409 }
    //   )
    // }

    // Send confirmation (mock)
    // await sendSMS({
    //   to: body.phone,
    //   message: `Đặt lịch thành công! Mã đặt lịch: ${bookingId}. Ngày: ${body.date} lúc ${body.time}`
    // })

    return secureResponse({
      success: true,
      bookingId,
      message: 'Booking created successfully',
      booking: {
        id: bookingId,
        date: body.date,
        time: body.time,
        workshopId: body.workshopId,
      },
    })
  } catch (error: any) {
    console.error('Booking error:', error)
    return securityErrorResponse('Failed to create booking', 500, { error: error.message })
  }
}
