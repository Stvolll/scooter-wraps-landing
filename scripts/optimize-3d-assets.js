#!/usr/bin/env node

/**
 * 3D Assets Optimization Script
 *
 * Optimizes GLB files using Draco compression and prepares them for CDN/S3 upload.
 *
 * Usage:
 *   node scripts/optimize-3d-assets.js
 *   node scripts/optimize-3d-assets.js --model yamaha-nvx
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const MODELS_DIR = path.join(process.cwd(), 'public', 'models')
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'models', 'optimized')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Get all GLB files
const glbFiles = fs
  .readdirSync(MODELS_DIR)
  .filter(file => file.endsWith('.glb'))
  .map(file => ({
    name: path.basename(file, '.glb'),
    input: path.join(MODELS_DIR, file),
    output: path.join(OUTPUT_DIR, `${path.basename(file, '.glb')}.draco.glb`),
  }))

if (glbFiles.length === 0) {
  console.log('❌ No GLB files found in public/models/')
  process.exit(1)
}

console.log('🚀 Starting 3D asset optimization...\n')

// Process each GLB file
glbFiles.forEach(({ name, input, output }) => {
  console.log(`📦 Processing: ${name}.glb`)

  try {
    // Get original size
    const originalSize = fs.statSync(input).size
    const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(2)

    console.log(`   Original size: ${originalSizeMB} MB`)

    // Optimize with gltf-pipeline (Draco compression)
    // Options:
    // -d: Enable Draco compression
    // -b: Binary output (GLB)
    // -q: Quality level (0-10, higher = better quality but larger file)
    // -tc: Texture compression (optional)
    const command = `npx gltf-pipeline -i "${input}" -o "${output}" -d -b -q 7`

    console.log(`   Compressing with Draco...`)
    execSync(command, { stdio: 'inherit' })

    // Get optimized size
    const optimizedSize = fs.statSync(output).size
    const optimizedSizeMB = (optimizedSize / (1024 * 1024)).toFixed(2)
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1)

    console.log(`   ✅ Optimized size: ${optimizedSizeMB} MB (${reduction}% reduction)`)
    console.log(`   📁 Output: ${path.relative(process.cwd(), output)}\n`)
  } catch (error) {
    console.error(`   ❌ Error processing ${name}:`, error.message)
  }
})

console.log('✨ Optimization complete!')
console.log('\n📋 Next steps:')
console.log('   1. Review optimized files in public/models/optimized/')
console.log('   2. Upload optimized .draco.glb files to CDN/S3')
console.log('   3. Update model paths in config/scooters.js to use CDN URLs')
console.log('   4. Add README.md in public/models/ with CDN links')
