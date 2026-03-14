import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Увеличиваем таймаут подключения к БД, если в URL ещё не задан (избегаем "Timed out fetching from connection pool")
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (!url) return url
  try {
    const hasParams = url.includes('?')
    if (!url.includes('connect_timeout=')) {
      return url + (hasParams ? '&' : '?') + 'connect_timeout=30'
    }
  } catch {
    // ignore
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

// Helper function to execute Prisma queries with timeout
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 1000,
  fallback: T | null = null
): Promise<T | null> {
  let timeoutId: NodeJS.Timeout | null = null
  let isResolved = false
  
  try {
    const timeoutPromise = new Promise<T | null>((_, reject) => {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          reject(new Error('Query timeout'))
        }
      }, timeoutMs)
    })
    
    const result = await Promise.race([
      promise.then(value => {
        if (!isResolved) {
          isResolved = true
          if (timeoutId) clearTimeout(timeoutId)
          return value
        }
        return fallback
      }),
      timeoutPromise
    ])
    
    if (timeoutId) clearTimeout(timeoutId)
    return result
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    // Silently return fallback on timeout or error
    return fallback
  }
}
