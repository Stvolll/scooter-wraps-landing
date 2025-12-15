import { prisma } from './prisma'
import crypto from 'crypto'

/**
 * Generate a 6-digit 2FA code
 */
export function generate2FACode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Create and store 2FA code for user
 */
export async function create2FACode(userId: string): Promise<string> {
  const code = generate2FACode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Delete old unused codes
  await prisma.twoFactorCode.deleteMany({
    where: {
      userId,
      OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
    },
  })

  // Create new code
  await prisma.twoFactorCode.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  })

  return code
}

/**
 * Verify 2FA code
 */
export async function verify2FACode(userId: string, code: string): Promise<boolean> {
  const twoFactorCode = await prisma.twoFactorCode.findFirst({
    where: {
      userId,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  })

  if (!twoFactorCode) {
    return false
  }

  // Mark code as used
  await prisma.twoFactorCode.update({
    where: { id: twoFactorCode.id },
    data: { used: true },
  })

  return true
}




