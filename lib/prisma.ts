// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` during development to avoid creating multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Lazy initialization - only create PrismaClient when actually used
function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Prisma Client is not initialized. Please set DATABASE_URL in your .env.local file.'
    )
  }

  if (global.prisma) {
    return global.prisma
  }

  const client = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = client
  }

  return client
}

// Export a proxy that creates PrismaClient only when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]

    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  },
})
