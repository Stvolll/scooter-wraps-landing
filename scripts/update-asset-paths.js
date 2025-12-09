#!/usr/bin/env node

/**
 * Update Asset Paths Script
 *
 * Updates model and texture paths in config files to use CDN URLs.
 *
 * Usage:
 *   node scripts/update-asset-paths.js
 *   node scripts/update-asset-paths.js --cdn-url https://cdn.example.com
 */

const fs = require('fs')
const path = require('path')

const CDN_URL =
  process.env.CDN_URL ||
  process.argv.find(arg => arg.startsWith('--cdn-url='))?.split('=')[1] ||
  'https://cdn.example.com'
const CDN_PREFIX = process.env.CDN_PREFIX || 'assets'

const CONFIG_FILE = path.join(process.cwd(), 'config', 'scooters.js')

if (!fs.existsSync(CONFIG_FILE)) {
  console.error('❌ Config file not found:', CONFIG_FILE)
  process.exit(1)
}

console.log('🔄 Updating asset paths to use CDN...\n')
console.log(`   CDN URL: ${CDN_URL}`)
console.log(`   CDN Prefix: ${CDN_PREFIX}\n`)

// Read config file
let configContent = fs.readFileSync(CONFIG_FILE, 'utf8')

// Replace model paths
configContent = configContent.replace(/model:\s*['"](.*?\.glb)['"]/g, (match, modelPath) => {
  const fileName = path.basename(modelPath, '.glb')
  const cdnPath = `${CDN_URL}/${CDN_PREFIX}/models/${fileName}.draco.glb`
  console.log(`   Model: ${modelPath} → ${cdnPath}`)
  return `model: '${cdnPath}'`
})

// Replace texture paths (with size variants)
configContent = configContent.replace(
  /texture:\s*['"](.*?\.(png|jpg|jpeg))['"]/g,
  (match, texturePath) => {
    const fileName = path.basename(texturePath, path.extname(texturePath))
    const dir = path.dirname(texturePath).replace('/textures/', '')
    // Use desktop version by default, can be made responsive
    const cdnPath = `${CDN_URL}/${CDN_PREFIX}/textures/${dir}/${fileName}.desktop.webp`
    console.log(`   Texture: ${texturePath} → ${cdnPath}`)
    return `texture: '${cdnPath}'`
  }
)

// Write updated config
fs.writeFileSync(CONFIG_FILE, configContent)

console.log('\n✅ Asset paths updated!')
console.log(`   Config file: ${path.relative(process.cwd(), CONFIG_FILE)}`)
console.log('\n⚠️  Note: Review the changes before committing!')
