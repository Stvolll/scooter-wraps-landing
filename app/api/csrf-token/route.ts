/**
 * CSRF Token Endpoint
 * Returns CSRF token for client-side requests
 */

import { NextResponse } from 'next/server'
import { getCSRFToken } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = await getCSRFToken()
    return NextResponse.json({ token })
  } catch (error: any) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 })
  }
}





