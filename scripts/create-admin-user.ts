/**
 * Script to create the first admin user
 * Usage: npx tsx scripts/create-admin-user.ts <email> <username> <password>
 */

import { prisma } from '../lib/prisma'
import { hashPassword, findUserByEmailOrUsername } from '../lib/auth'

async function createAdminUser() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error('Usage: npx tsx scripts/create-admin-user.ts <email> <username> <password>')
    process.exit(1)
  }

  const [email, username, password] = args

  try {
    // Check if user already exists
    const existing = await findUserByEmailOrUsername(email)
    if (existing) {
      console.error('❌ User with this email or username already exists')
      process.exit(1)
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        emailVerified: true,
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('   Email:', user.email)
    console.log('   Username:', user.username)
    console.log('   ID:', user.id)
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()




