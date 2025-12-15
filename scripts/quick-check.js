#!/usr/bin/env node

/**
 * Quick Health Check - Fast validation without full build
 * Use this for frequent checks during development
 */

const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
let hasErrors = false
const errors = []
const warnings = []

console.log('⚡ Quick health check...\n')

// 1. Check essential files
const essentialFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'components/ScooterViewer.jsx',
  'config/scooters.js',
]

essentialFiles.forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (!fs.existsSync(filePath)) {
    errors.push(`❌ Missing: ${file}`)
    hasErrors = true
  }
})

// 2. Check for common syntax issues
const checkSyntax = (filePath, fileName) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // Check for unclosed brackets
    const openBraces = (content.match(/{/g) || []).length
    const closeBraces = (content.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      warnings.push(`⚠️  Possible bracket mismatch in ${fileName}`)
    }

    // Check for problematic patterns
    if (
      content.includes('from') &&
      content.includes('_document') &&
      !content.includes('pages/_document')
    ) {
      errors.push(`❌ Invalid _document import in ${fileName}`)
      hasErrors = true
    }

    // Check for undefined variables in key components
    if (fileName.includes('ScooterViewer')) {
      const requiredHooks = ['useState', 'useEffect', 'useRef']
      requiredHooks.forEach(hook => {
        if (!content.includes(hook)) {
          warnings.push(`⚠️  ${fileName} might be missing ${hook}`)
        }
      })
    }
  } catch (error) {
    errors.push(`❌ Error reading ${fileName}: ${error.message}`)
    hasErrors = true
  }
}

// Check key files
;['app/page.tsx', 'app/layout.tsx', 'components/ScooterViewer.jsx'].forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (fs.existsSync(filePath)) {
    checkSyntax(filePath, file)
  }
})

// Summary
if (hasErrors) {
  console.log('❌ Quick check FAILED\n')
  errors.forEach(err => console.log(err))
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(warn => console.log(warn))
  }
  process.exit(1)
} else {
  console.log('✅ Quick check passed')
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(warn => console.log(warn))
  }
  process.exit(0)
}




