import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL('/admin/designs/new', request.url)
  return NextResponse.redirect(url, 301)
}

export async function POST(request: NextRequest) {
  const url = new URL('/admin/designs/new', request.url)
  return NextResponse.redirect(url, 301)
}

