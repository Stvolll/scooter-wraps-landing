/**
 * Script to create placeholder texture images
 * Run with: node scripts/create-placeholder-textures.js
 */

const fs = require('fs')
const path = require('path')

// Create a simple PNG using base64 encoded 1x1 pixel images
// We'll create colored squares as placeholders

const textures = {
  vision: ['neon.png', 'holo.png', 'carbon.png', 'racing.png'],
  lead: ['neon.png', 'holo.png', 'carbon.png'],
  sh: ['neon.png', 'holo.png', 'carbon.png', 'racing.png'],
  pcx: ['neon.png', 'holo.png', 'carbon.png'],
  nvx: ['neon.png', 'holo.png', 'carbon.png', 'racing.png'],
}

// Colors in RGB
const colors = {
  'neon.png': { r: 0, g: 255, b: 136 }, // Neon green
  'holo.png': { r: 0, g: 102, b: 255 }, // Electric blue
  'carbon.png': { r: 40, g: 40, b: 40 }, // Dark gray
  'racing.png': { r: 255, g: 0, b: 102 }, // Neon pink
}

// Create a simple 2048x2048 PNG using a minimal PNG structure
// This is a simplified approach - for production, use a proper image library
function createColorPNG(color, width = 2048, height = 2048) {
  // For now, we'll create a simple colored image using canvas-like approach
  // Since we don't have canvas in Node, we'll create a minimal valid PNG

  // This is a minimal 1x1 pixel PNG structure
  // We'll create a simple solid color image
  // Note: This is a simplified version. For production, use sharp or jimp library

  // For now, let's create a simple approach using base64
  // We'll create files that can be replaced later with actual textures
  return Buffer.from(`PLACEHOLDER_TEXTURE_${color.r}_${color.g}_${color.b}`, 'utf8')
}

const baseDir = path.join(__dirname, '..', 'public', 'textures')

// Ensure directories exist
Object.keys(textures).forEach(model => {
  const modelDir = path.join(baseDir, model)
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true })
    console.log(`Created directory: ${modelDir}`)
  }
})

// Create placeholder files
Object.entries(textures).forEach(([model, files]) => {
  files.forEach(filename => {
    const filepath = path.join(baseDir, model, filename)

    if (!fs.existsSync(filepath)) {
      const color = colors[filename]
      if (color) {
        // Create a simple text file as placeholder (will be replaced with actual images)
        const placeholder = `# Placeholder texture: ${filename}\n# Color: RGB(${color.r}, ${color.g}, ${color.b})\n# Size: 2048x2048\n# Replace this file with actual PNG texture image`
        fs.writeFileSync(filepath, placeholder)
        console.log(`Created placeholder: ${filepath}`)
      }
    } else {
      console.log(`Exists: ${filepath}`)
    }
  })
})

console.log('\n✅ Placeholder files created!')
console.log(
  '⚠️  Note: These are text placeholders. Replace with actual PNG images (2048x2048 recommended).'
)
