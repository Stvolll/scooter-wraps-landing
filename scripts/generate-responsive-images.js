#!/usr/bin/env node

/**
 * Generate responsive image versions
 * Reads images from public/images/designs/ (jpg, png files)
 * Generates sizes [320, 640, 1024, 1600] in WebP and AVIF formats
 * Outputs to public/_optimized/ with manifest.json
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

const SIZES = [320, 640, 1024, 1600]
const OUTPUT_DIR = path.join(process.cwd(), 'public', '_optimized')
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json')

async function generateResponsiveImages() {
  console.log('🖼️  Generating responsive images...\n')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const manifest = {}

  // Find all images
  const imageFiles = await glob('public/images/designs/**/*.{jpg,jpeg,png}', {
    ignore: ['node_modules/**', '.next/**'],
  })

  console.log(`Found ${imageFiles.length} images to process\n`)

  for (const imagePath of imageFiles) {
    const relativePath = path.relative('public', imagePath)
    const baseName = path.basename(relativePath, path.extname(relativePath))
    const dirName = path.dirname(relativePath)

    console.log(`Processing: ${relativePath}`)

    const image = sharp(imagePath)
    const metadata = await image.metadata()

    const variants = {
      original: `/${relativePath}`,
      webp: {},
      avif: {},
    }

    // Generate sizes for WebP
    for (const size of SIZES) {
      if (metadata.width && metadata.width < size) continue

      const webpPath = path.join(OUTPUT_DIR, dirName, `${baseName}-${size}w.webp`)
      const avifPath = path.join(OUTPUT_DIR, dirName, `${baseName}-${size}w.avif`)

      // Ensure directory exists
      const outputDir = path.dirname(webpPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Generate WebP
      await image
        .clone()
        .resize(size, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(webpPath)

      variants.webp[`${size}w`] = `/` + path.relative('public', webpPath)

      // Generate AVIF
      await image
        .clone()
        .resize(size, null, { withoutEnlargement: true })
        .avif({ quality: 80 })
        .toFile(avifPath)

      variants.avif[`${size}w`] = `/` + path.relative('public', avifPath)
    }

    manifest[`/${relativePath}`] = variants
  }

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

  console.log(`\n✅ Generated ${Object.keys(manifest).length} image variants`)
  console.log(`📋 Manifest: ${MANIFEST_PATH}`)
}

generateResponsiveImages().catch(console.error)
