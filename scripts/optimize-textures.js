#!/usr/bin/env node

/**
 * Texture Optimization Script
 *
 * Converts textures to optimized formats (WebP, AVIF) and generates
 * mobile/desktop versions.
 *
 * Usage:
 *   node scripts/optimize-textures.js
 *   node scripts/optimize-textures.js --format webp
 *   node scripts/optimize-textures.js --format avif
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const TEXTURES_DIR = path.join(process.cwd(), 'public', 'textures')
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'textures', 'optimized')

// Configuration
const FORMATS = {
  webp: { quality: 85, effort: 6 },
  avif: { quality: 80, effort: 4 },
}

const SIZES = {
  mobile: { width: 512, height: 512 },
  desktop: { width: 1024, height: 1024 },
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Get format from command line args
const formatArg = process.argv.find(arg => arg.startsWith('--format='))
const format = formatArg ? formatArg.split('=')[1] : 'webp'

if (!FORMATS[format]) {
  console.error(`❌ Unsupported format: ${format}`)
  console.error(`   Supported formats: ${Object.keys(FORMATS).join(', ')}`)
  process.exit(1)
}

console.log(`🚀 Starting texture optimization (format: ${format})...\n`)

// Recursively find all image files
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findImages(filePath, fileList)
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

const imageFiles = findImages(TEXTURES_DIR)

if (imageFiles.length === 0) {
  console.log('❌ No image files found in public/textures/')
  process.exit(1)
}

console.log(`Found ${imageFiles.length} images to optimize\n`)

// Process each image
let processed = 0
let totalOriginalSize = 0
let totalOptimizedSize = 0

imageFiles.forEach(async inputPath => {
  try {
    const relativePath = path.relative(TEXTURES_DIR, inputPath)
    const dir = path.dirname(relativePath)
    const name = path.basename(relativePath, path.extname(relativePath))

    // Create output directory structure
    const outputDir = path.join(OUTPUT_DIR, dir)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Get original size
    const originalSize = fs.statSync(inputPath).size
    totalOriginalSize += originalSize

    // Process for each size variant
    for (const [sizeName, size] of Object.entries(SIZES)) {
      const outputPath = path.join(outputDir, `${name}.${sizeName}.${format}`)

      // Resize and convert
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        [format](FORMATS[format])
        .toFile(outputPath)

      const optimizedSize = fs.statSync(outputPath).size
      totalOptimizedSize += optimizedSize

      console.log(`✅ ${relativePath} → ${path.relative(OUTPUT_DIR, outputPath)}`)
      console.log(
        `   ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (${sizeName})`
      )
    }

    processed++

    if (processed === imageFiles.length) {
      const totalReduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)
      console.log(`\n✨ Optimization complete!`)
      console.log(`   Processed: ${processed} images`)
      console.log(`   Total size reduction: ${totalReduction}%`)
      console.log(`   Original: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`)
      console.log(`   Optimized: ${(totalOptimizedSize / (1024 * 1024)).toFixed(2)} MB`)
      console.log(`\n📁 Output directory: ${path.relative(process.cwd(), OUTPUT_DIR)}`)
    }
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message)
  }
})

