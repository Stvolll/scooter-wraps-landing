#!/usr/bin/env node

/**
 * CDN/S3 Upload Script
 *
 * Uploads optimized 3D assets and textures to CDN/S3.
 *
 * Usage:
 *   node scripts/upload-to-cdn.js
 *   node scripts/upload-to-cdn.js --dry-run
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

// Configuration
const DRY_RUN = process.argv.includes('--dry-run')
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.CDN_BUCKET_NAME
const CDN_PREFIX = process.env.CDN_PREFIX || 'assets'

if (!BUCKET_NAME && !DRY_RUN) {
  console.error('❌ AWS_S3_BUCKET_NAME or CDN_BUCKET_NAME environment variable is required')
  process.exit(1)
}

// Initialize S3 client
let s3Client = null
if (!DRY_RUN) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })
}

const OPTIMIZED_MODELS_DIR = path.join(process.cwd(), 'public', 'models', 'optimized')
const OPTIMIZED_TEXTURES_DIR = path.join(process.cwd(), 'public', 'textures', 'optimized')

// Upload file to S3
async function uploadFile(filePath, key) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would upload: ${filePath} → s3://${BUCKET_NAME}/${key}`)
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
  }

  const fileContent = fs.readFileSync(filePath)
  const contentType = mime.lookup(filePath) || 'application/octet-stream'

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  })

  await s3Client.send(command)

  const url = process.env.AWS_CLOUDFRONT_DOMAIN
    ? `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`
    : `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`

  return url
}

// Recursively find all files in directory
function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList
  }

  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findFiles(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  })

  return fileList
}

async function main() {
  console.log('🚀 Starting CDN upload...\n')

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be uploaded\n')
  }

  const uploads = []

  // Upload optimized models
  if (fs.existsSync(OPTIMIZED_MODELS_DIR)) {
    const modelFiles = findFiles(OPTIMIZED_MODELS_DIR)

    for (const filePath of modelFiles) {
      const relativePath = path.relative(OPTIMIZED_MODELS_DIR, filePath)
      const key = `${CDN_PREFIX}/models/${relativePath}`

      console.log(`📦 Uploading model: ${relativePath}`)
      const url = await uploadFile(filePath, key)
      uploads.push({ type: 'model', path: relativePath, url })
      console.log(`   ✅ ${url}\n`)
    }
  }

  // Upload optimized textures
  if (fs.existsSync(OPTIMIZED_TEXTURES_DIR)) {
    const textureFiles = findFiles(OPTIMIZED_TEXTURES_DIR)

    for (const filePath of textureFiles) {
      const relativePath = path.relative(OPTIMIZED_TEXTURES_DIR, filePath)
      const key = `${CDN_PREFIX}/textures/${relativePath}`

      console.log(`🖼️  Uploading texture: ${relativePath}`)
      const url = await uploadFile(filePath, key)
      uploads.push({ type: 'texture', path: relativePath, url })
      console.log(`   ✅ ${url}\n`)
    }
  }

  // Generate manifest
  const manifest = {
    uploadedAt: new Date().toISOString(),
    cdnPrefix: CDN_PREFIX,
    cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || null,
    uploads,
  }

  const manifestPath = path.join(process.cwd(), 'cdn-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  console.log('✨ Upload complete!')
  console.log(`📋 Manifest saved to: ${path.relative(process.cwd(), manifestPath)}`)
  console.log(`   Total files uploaded: ${uploads.length}`)
}

main().catch(console.error)
