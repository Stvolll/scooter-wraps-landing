/**
 * One-off: create/update Yamaha NVX model in DB.
 * GLB: /models/MODEL/MODEL-Yamaha-NVX.glb
 * Panorama: /models/MODEL/DESIGNS/Design-1/panorama-D1.webp
 * Run: npx tsx scripts/create-yamaha-nvx-model.ts (set DATABASE_URL or use .env.local)
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

// Load .env.local if present
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  })
}

const prisma = new PrismaClient()

const SLUG = 'nvx'
const NAME = 'Yamaha NVX'
const GLB_URL = '/models/MODEL/MODEL-Yamaha-NVX.glb'
const PANORAMA_URL = '/models/MODEL/DESIGNS/Design-1/panorama-D1.webp'

async function main() {
  const model = await prisma.scooterModel.upsert({
    where: { slug: SLUG },
    update: {
      name: NAME,
      model: GLB_URL,
      glbModelUrl: GLB_URL,
      panorama: PANORAMA_URL,
      active: true,
    },
    create: {
      slug: SLUG,
      name: NAME,
      model: GLB_URL,
      glbModelUrl: GLB_URL,
      panorama: PANORAMA_URL,
      active: true,
      order: 0,
    },
  })
  console.log('Yamaha NVX model created/updated:', model.id, model.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
