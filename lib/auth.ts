import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'

export interface AuthUser {
  id: string
  email: string
  username: string
  twoFactorEnabled: boolean
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      twoFactorEnabled: user.twoFactorEnabled,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Find user by email or username
 */
export async function findUserByEmailOrUsername(emailOrUsername: string): Promise<{
  id: string
  email: string
  username: string
  passwordHash: string
  twoFactorEnabled: boolean
  isActive: boolean
} | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
    select: {
      id: true,
      email: true,
      username: true,
      passwordHash: true,
      twoFactorEnabled: true,
      isActive: true,
    },
  })

  return user
}

/**
 * Create new user
 */
export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<{ id: string; email: string; username: string }> {
  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  })

  return user
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })
}


