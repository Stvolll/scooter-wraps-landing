// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` during development to avoid creating multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Lazy initialization - only create PrismaClient when actually used
function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    console.warn(
      '⚠️ Prisma Client is not initialized. Please set DATABASE_URL in your .env.local file.'
    )
    return null
  }

  if (global.prisma) {
    return global.prisma
  }

  try {
    const client = new PrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = client
    }
    return client
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error)
    return null
  }
}

// Export a proxy that creates PrismaClient only when accessed
// Returns null if DATABASE_URL is not set, allowing graceful degradation
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    if (!client) {
      // Return a no-op function for methods, null for properties
      if (typeof prop === 'string' && prop.startsWith('$')) {
        // Prisma methods like $transaction, $connect, etc.
        return async () => {
          throw new Error(
            'Prisma Client is not initialized. Please set DATABASE_URL in your .env.local file.'
          )
        }
      }
      // For model access (design, deal, etc.), return a proxy that throws on access
      return new Proxy(
        {},
        {
          get() {
            throw new Error(
              'Prisma Client is not initialized. Please set DATABASE_URL in your .env.local file.'
            )
          },
        }
      )
    }

    const value = (client as any)[prop]

    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  },
})
