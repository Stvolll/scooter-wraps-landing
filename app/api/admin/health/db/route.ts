// app/api/admin/health/db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('admin_auth')?.value

    if (!authCookie || authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if DATABASE_URL is configured
    const dbConfigured = !!process.env.DATABASE_URL

    return NextResponse.json({
      configured: dbConfigured,
      message: dbConfigured
        ? 'Database is configured'
        : 'DATABASE_URL is not set in environment variables',
    })
  } catch (error: any) {
    return NextResponse.json(
      { configured: false, error: error.message || 'Failed to check database configuration' },
      { status: 500 }
    )
  }
}






