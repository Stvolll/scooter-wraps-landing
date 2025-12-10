import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/contact
 * Handles contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, model, message } = body

    // Basic validation
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Validate phone format (basic check)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // TODO: Save to database if needed
    // TODO: Send notification to admin

    // For now, just log the submission
    console.log('Contact form submission:', {
      name,
      phone,
      model,
      message,
      timestamp: new Date().toISOString(),
    })

    // Simulate email sending (replace with actual email service)
    // await sendEmail({
    //   to: 'hello@txd.vn',
    //   subject: `New Contact Form Submission from ${name}`,
    //   body: `Name: ${name}\nPhone: ${phone}\nModel: ${model}\nMessage: ${message}`,
    // })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will contact you within 2 hours.',
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}


