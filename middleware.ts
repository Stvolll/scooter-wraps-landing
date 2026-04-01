/**
 * Next.js Middleware for security headers and routing guards.
 * Runs on every request before the route handler.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if request is for placeholder domains
  const hostname = request.headers.get('host') || ''
  const isPlaceholderDomain = hostname.includes('txd.bike') || hostname.includes('decalwrap.co')
  
  // Allow access to coming-soon page and static assets
  const isComingSoonPage = request.nextUrl.pathname.startsWith('/coming-soon')
  const isStaticAsset = 
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/)

  // Redirect to coming-soon page for placeholder domains (except for coming-soon page itself and static assets)
  if (isPlaceholderDomain && !isComingSoonPage && !isStaticAsset) {
    return NextResponse.rewrite(new URL('/coming-soon', request.url))
  }

  const response = NextResponse.next()

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://ajax.googleapis.com https://unpkg.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' blob: data: https://api.bybit.com https://api-testnet.bybit.com https://*.amazonaws.com https://*.cloudfront.net https://www.google-analytics.com https://www.googletagmanager.com https://ajax.googleapis.com",
    "frame-src 'self' https://www.google.com https://maps.google.com https://maps.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|hdr)).*)',
  ],
}
