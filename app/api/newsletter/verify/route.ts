/**
 * Newsletter Verification API
 * Verifies email subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 })
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { verificationToken: token },
    })

    if (!subscriber) {
      return NextResponse.json({ success: false, error: 'Invalid verification token' }, { status: 404 })
    }

    if (subscriber.verified) {
      // Already verified, redirect to success page
      redirect('/newsletter/verified?status=already')
    }

    // Verify subscriber
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { verified: true, verificationToken: null },
    })

    // Redirect to success page
    redirect('/newsletter/verified?status=success')
  } catch (error: any) {
    console.error('Newsletter verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}


