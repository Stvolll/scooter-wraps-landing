import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Hardcoded credentials for MVP
const ADMIN_USERNAME = 'Stvolll'
const ADMIN_PASSWORD = 'a840309A'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Simple credential check
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const cookieStore = await cookies()

      // Set simple auth cookie
      cookieStore.set('admin_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/admin',
      })

      return NextResponse.json({
        success: true,
        user: {
          username: ADMIN_USERNAME,
        },
      })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}
