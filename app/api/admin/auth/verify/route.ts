import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<NextResponse>((resolve) => {
      setTimeout(() => {
        resolve(NextResponse.json({ authenticated: false }, { status: 401 }))
      }, 500)
    })
    
    const authCheck = async () => {
      const cookieStore = await cookies()
      const authCookie = cookieStore.get('admin_auth')?.value

      if (!authCookie || authCookie !== 'authenticated') {
        return NextResponse.json({ authenticated: false }, { status: 401 })
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          username: 'Stvolll',
        },
      })
    }
    
    return await Promise.race([authCheck(), timeoutPromise])
  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
