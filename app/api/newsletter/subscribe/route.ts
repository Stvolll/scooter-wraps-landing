/**
 * Newsletter Subscription API
 * Handles email subscriptions for marketing campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidEmail, sanitizeInput } from '@/lib/security'
import { sendEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, preferences = [] } = body

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedName = name ? sanitizeInput(name) : null

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: sanitizedEmail },
    })

    if (existing && existing.subscribed) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter',
        verified: existing.verified,
      })
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex')

    // Create or update subscriber
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: sanitizedEmail },
      update: {
        name: sanitizedName,
        subscribed: true,
        preferences: preferences.filter((p: string) => ['new_designs', 'promotions', 'tips'].includes(p)),
        verificationToken,
        verified: false,
      },
      create: {
        email: sanitizedEmail,
        name: sanitizedName,
        subscribed: true,
        preferences: preferences.filter((p: string) => ['new_designs', 'promotions', 'tips'].includes(p)),
        verificationToken,
        verified: false,
      },
    })

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/newsletter/verify?token=${verificationToken}`

    await sendEmail({
      to: subscriber.email,
      subject: 'Verify your newsletter subscription',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%); padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: white; margin: 0;">Welcome to TXD Newsletter!</h1>
              </div>
              <div class="content">
                <p>Hi ${subscriber.name || 'there'},</p>
                <p>Thank you for subscribing to our newsletter! We're excited to share the latest designs, promotions, and tips with you.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p>If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>TXD Scooter Wraps</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to TXD Newsletter!

Hi ${subscriber.name || 'there'},

Thank you for subscribing to our newsletter! Please verify your email address by visiting:

${verificationUrl}

If you didn't subscribe, you can safely ignore this email.

TXD Scooter Wraps
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription successful! Please check your email to verify your subscription.',
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!subscriber) {
      return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 })
    }

    // Verify token if provided
    if (token && subscriber.verificationToken !== token) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 })
    }

    // Unsubscribe
    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase() },
      data: { subscribed: false },
    })

    return NextResponse.json({ success: true, message: 'Successfully unsubscribed' })
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe. Please try again later.' },
      { status: 500 }
    )
  }
}





