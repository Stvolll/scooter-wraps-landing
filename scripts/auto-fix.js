#!/usr/bin/env node
/**
 * Auto-fix script for common Next.js/React errors
 * Run: node scripts/auto-fix.js
 */

const fs = require('fs')
const path = require('path')

const issues = []
const fixes = []

// Check 1: Verify hooks order in ScooterViewer
function checkHooksOrder() {
  const filePath = path.join(__dirname, '..', 'components', 'ScooterViewer.jsx')
  if (!fs.existsSync(filePath)) {
    issues.push('ScooterViewer.jsx not found')
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  let hooksFound = []
  let conditionalReturnFound = false
  let conditionalReturnLine = -1

  lines.forEach((line, index) => {
    // Check for hooks
    if (line.includes('useState') || line.includes('useEffect') || line.includes('useRef')) {
      hooksFound.push({ type: 'hook', line: index + 1, content: line.trim() })
    }

    // Check for early returns (before all hooks are called)
    if (line.includes('if (') && line.includes('return') && !conditionalReturnFound) {
      // Check if this is before all hooks
      const hookCount = hooksFound.length
      if (hookCount < 7) {
        // We expect 3 useState + 4 useEffect = 7 hooks
        conditionalReturnFound = true
        conditionalReturnLine = index + 1
      }
    }
  })

  if (conditionalReturnFound && conditionalReturnLine < 150) {
    issues.push(
      `⚠️  Potential hooks order issue: conditional return at line ${conditionalReturnLine}`
    )
  } else {
    console.log('✅ Hooks order is correct')
  }
}

// Check 2: Verify dynamic import with ssr: false
function checkDynamicImport() {
  const filePath = path.join(__dirname, '..', 'app', 'page.tsx')
  if (!fs.existsSync(filePath)) {
    issues.push('page.tsx not found')
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')

  if (!content.includes('dynamic')) {
    issues.push('❌ Dynamic import not found in page.tsx')
    return
  }

  if (!content.includes('ssr: false')) {
    issues.push('❌ ssr: false not set in dynamic import')
    fixes.push('Add ssr: false to dynamic import')
  } else {
    console.log('✅ Dynamic import with ssr: false is correct')
  }
}

// Check 3: Verify suppressHydrationWarning
function checkSuppressHydration() {
  const filePath = path.join(__dirname, '..', 'components', 'ScooterViewer.jsx')
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, 'utf8')

  if (!content.includes('suppressHydrationWarning')) {
    issues.push('⚠️  suppressHydrationWarning not found')
    fixes.push('Add suppressHydrationWarning to problematic elements')
  } else {
    console.log('✅ suppressHydrationWarning is present')
  }
}

// Check 4: Verify model-viewer script in layout
function checkModelViewerScript() {
  const filePath = path.join(__dirname, '..', 'app', 'layout.tsx')
  if (!fs.existsSync(filePath)) {
    issues.push('layout.tsx not found')
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')

  if (!content.includes('model-viewer')) {
    issues.push('❌ model-viewer script not found in layout.tsx')
    fixes.push('Add model-viewer script to layout.tsx')
  } else {
    console.log('✅ model-viewer script is present')
  }
}

// Run all checks
console.log('🔍 Running automatic checks...\n')

checkHooksOrder()
checkDynamicImport()
checkSuppressHydration()
checkModelViewerScript()

// Report
console.log('\n📊 Summary:')
if (issues.length === 0) {
  console.log('✅ No issues found!')
} else {
  console.log(`⚠️  Found ${issues.length} potential issue(s):`)
  issues.forEach(issue => console.log(`   ${issue}`))

  if (fixes.length > 0) {
    console.log('\n🔧 Suggested fixes:')
    fixes.forEach(fix => console.log(`   - ${fix}`))
  }
}

process.exit(issues.length > 0 ? 1 : 0)
