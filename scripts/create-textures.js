/**
 * Create placeholder texture images (2048x2048 PNG)
 * Run: node scripts/create-textures.js
 */

const fs = require('fs')
const path = require('path')

let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('Sharp not installed. Installing...')
  console.error('Run: npm install --save-dev sharp')
  process.exit(1)
}

const textures = {
  vision: ['neon.png', 'holo.png', 'carbon.png', 'racing.png'],
  lead: ['neon.png', 'holo.png', 'carbon.png'],
  sh: ['neon.png', 'holo.png', 'carbon.png', 'racing.png'],
  pcx: ['neon.png', 'holo.png', 'carbon.png'],
  nvx: ['neon.png', 'holo.png', 'carbon.png', 'racing.png'],
}

const colors = {
  'neon.png': { r: 0, g: 255, b: 136 }, // Neon green #00FF88
  'holo.png': { r: 0, g: 102, b: 255 }, // Electric blue #0066FF
  'carbon.png': { r: 40, g: 40, b: 40 }, // Dark gray #282828
  'racing.png': { r: 255, g: 0, b: 102 }, // Neon pink #FF0066
}

const baseDir = path.join(__dirname, '..', 'public', 'textures')
const size = 2048

async function createTextures() {
  // Ensure directories exist
  Object.keys(textures).forEach(model => {
    const modelDir = path.join(baseDir, model)
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true })
    }
  })

  // Create textures
  for (const [model, files] of Object.entries(textures)) {
    for (const filename of files) {
      const filepath = path.join(baseDir, model, filename)

      // Skip if file exists and is a valid PNG
      if (fs.existsSync(filepath)) {
        try {
          const stats = fs.statSync(filepath)
          if (stats.size > 1000) {
            // Real PNG should be > 1KB
            console.log(`✓ Exists: ${filepath}`)
            continue
          }
        } catch (e) {
          // Continue to create
        }
      }

      const color = colors[filename]
      if (!color) {
        console.warn(`⚠ No color defined for ${filename}`)
        continue
      }

      try {
        // Create solid color image
        await sharp({
          create: {
            width: size,
            height: size,
            channels: 3,
            background: { r: color.r, g: color.g, b: color.b },
          },
        })
          .png({ quality: 90, compressionLevel: 6 })
          .toFile(filepath)

        console.log(
          `✓ Created: ${filepath} (${size}x${size}, RGB(${color.r},${color.g},${color.b}))`
        )
      } catch (error) {
        console.error(`✗ Failed to create ${filepath}:`, error.message)
      }
    }
  }

  console.log('\n✅ All texture placeholders created!')
  console.log(`📐 Size: ${size}x${size} pixels`)
  console.log('⚠️  Replace these with actual texture images for production')
}

createTextures().catch(console.error)
