#!/usr/bin/env node

/**
 * Auto Verification Script
 * Runs quick checks after code changes
 * Called automatically by AI assistant
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')

function quickVerify() {
  console.log('🔍 Auto-verifying changes...\n')

  let hasErrors = false

  // 1. Quick file existence check
  const criticalFiles = ['app/page.tsx', 'app/layout.tsx', 'components/ScooterViewer.jsx']

  for (const file of criticalFiles) {
    if (!fs.existsSync(path.join(projectRoot, file))) {
      console.log(`❌ Missing critical file: ${file}`)
      hasErrors = true
    }
  }

  // 2. Syntax check (lightweight)
  try {
    const pageContent = fs.readFileSync(path.join(projectRoot, 'app/page.tsx'), 'utf8')

    // Check for common issues
    if (
      pageContent.includes('from') &&
      pageContent.includes('_document') &&
      !pageContent.includes('pages/_document')
    ) {
      console.log('❌ Invalid _document import detected')
      hasErrors = true
    }

    // Check for unclosed imports
    const importLines = pageContent.split('\n').filter(line => line.trim().startsWith('import'))
    for (const line of importLines) {
      if (line.includes('from') && !line.includes("'") && !line.includes('"')) {
        console.log(`⚠️  Suspicious import line: ${line.substring(0, 50)}...`)
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not verify syntax: ${error.message}`)
  }

  if (hasErrors) {
    console.log('\n❌ Verification failed - please fix errors')
    return false
  }

  console.log('✅ Quick verification passed\n')
  return true
}

// Run verification
if (require.main === module) {
  const success = quickVerify()
  process.exit(success ? 0 : 1)
}

module.exports = { quickVerify }


