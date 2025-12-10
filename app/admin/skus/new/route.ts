import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect(new URL('/admin/designs/new', process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'), 301)
}

export async function POST() {
  return NextResponse.redirect(new URL('/admin/designs/new', process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'), 301)
}

