/**
 * Canonical public site origin for server-side fetch / absolute URLs.
 * Production must not rely on localhost; set NEXT_PUBLIC_SITE_URL on Vercel.
 */

export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  if (explicit) return explicit
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000'
  console.error(
    '[site-url] NEXT_PUBLIC_SITE_URL is unset in production; server-side absolute URLs may fail.'
  )
  return ''
}
