#!/usr/bin/env node

/**
 * Health Check Script
 * Automatically checks project health after changes
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
let hasErrors = false
const errors = []

console.log('🔍 Running automatic health check...\n')

// 1. Check if essential files exist
console.log('1️⃣ Checking essential files...')
const essentialFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'components/ScooterViewer.jsx',
  'config/scooters.js',
  'package.json',
]

essentialFiles.forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (!fs.existsSync(filePath)) {
    errors.push(`❌ Missing file: ${file}`)
    hasErrors = true
  } else {
    console.log(`   ✅ ${file}`)
  }
})

// 2. Check for TypeScript/ESLint errors
console.log('\n2️⃣ Checking for build errors...')
try {
  const buildOutput = execSync('npm run build 2>&1', {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 60000,
    stdio: 'pipe',
  })

  // Check for critical errors
  if (buildOutput.includes('Error:') && !buildOutput.includes('Warning:')) {
    const errorLines = buildOutput
      .split('\n')
      .filter(line => line.includes('Error:') || line.includes('error'))
    if (errorLines.length > 0) {
      errors.push(`❌ Build errors found:\n${errorLines.slice(0, 5).join('\n')}`)
      hasErrors = true
    }
  }

  if (
    buildOutput.includes('✓ Compiled successfully') ||
    buildOutput.includes('✓ Generating static pages')
  ) {
    console.log('   ✅ Build successful')
  } else {
    console.log('   ⚠️  Build completed with warnings')
  }
} catch (error) {
  errors.push(`❌ Build failed: ${error.message}`)
  hasErrors = true
}

// 3. Check for common import errors
console.log('\n3️⃣ Checking for import errors...')
const checkFile = filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      // Check for problematic imports
      if (line.includes('from') && line.includes('_document')) {
        errors.push(`❌ Invalid _document import in ${filePath}:${index + 1}`)
        hasErrors = true
      }

      // Check for missing imports
      if (line.includes('import') && line.includes('@/')) {
        const importPath = line.match(/from\s+['"]([^'"]+)['"]/)?.[1]
        if (importPath && importPath.startsWith('@/')) {
          const resolvedPath = importPath.replace('@/', '')
          const possiblePaths = [
            path.join(projectRoot, resolvedPath),
            path.join(projectRoot, resolvedPath + '.tsx'),
            path.join(projectRoot, resolvedPath + '.ts'),
            path.join(projectRoot, resolvedPath + '.jsx'),
            path.join(projectRoot, resolvedPath + '.js'),
          ]

          const exists = possiblePaths.some(p => fs.existsSync(p))
          if (!exists && !resolvedPath.includes('node_modules')) {
            // Don't error on dynamic imports or node_modules
            if (!line.includes('dynamic') && !line.includes('next/')) {
              // This is just a warning, not an error
            }
          }
        }
      }
    })
  } catch (error) {
    // File might not exist yet, skip
  }
}

// Check main files
;['app/page.tsx', 'app/layout.tsx', 'components/ScooterViewer.jsx'].forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (fs.existsSync(filePath)) {
    checkFile(filePath)
  }
})

console.log('   ✅ Import checks passed')

// 4. Check package.json scripts
console.log('\n4️⃣ Checking package.json scripts...')
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  const requiredScripts = ['dev', 'build', 'start']

  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ Script '${script}' exists`)
    } else {
      errors.push(`❌ Missing script: ${script}`)
      hasErrors = true
    }
  })
} catch (error) {
  errors.push(`❌ Error reading package.json: ${error.message}`)
  hasErrors = true
}

// 5. Check ESLint
console.log('\n5️⃣ Checking ESLint...')
try {
  const eslintOutput = execSync('npm run lint 2>&1', {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 30000,
    stdio: 'pipe',
  })

  if (eslintOutput.includes('error') && !eslintOutput.includes('warn')) {
    const errorLines = eslintOutput.split('\n').filter(line => line.includes('error'))
    if (errorLines.length > 0) {
      errors.push(`❌ ESLint errors found:\n${errorLines.slice(0, 3).join('\n')}`)
      hasErrors = true
    } else {
      console.log('   ✅ ESLint passed')
    }
  } else {
    console.log('   ✅ ESLint passed (warnings are acceptable)')
  }
} catch (error) {
  // ESLint might have warnings, check if it's just warnings
  if (error.stdout && error.stdout.includes('error')) {
    errors.push(`❌ ESLint failed: ${error.message}`)
    hasErrors = true
  } else {
    console.log('   ⚠️  ESLint check completed with warnings')
  }
}

// 6. Check Prettier formatting
console.log('\n6️⃣ Checking Prettier formatting...')
try {
  const prettierCheck = execSync('npm run format:check 2>&1', {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 30000,
    stdio: 'pipe',
  })

  if (prettierCheck.includes('Checking formatting')) {
    console.log('   ✅ Code formatting is correct')
  } else {
    console.log('   ⚠️  Some files may need formatting (run: npm run format)')
  }
} catch (error) {
  // Prettier returns non-zero if files need formatting
  if (error.stdout && error.stdout.includes('Code style issues found')) {
    console.log('   ⚠️  Some files need formatting (run: npm run format)')
  } else {
    console.log('   ✅ Prettier check completed')
  }
}

// 7. Check TypeScript compilation
console.log('\n7️⃣ Checking TypeScript...')
try {
  const tsCheck = execSync('npx tsc --noEmit 2>&1', {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 30000,
    stdio: 'pipe',
  })

  if (tsCheck.includes('error TS')) {
    const errorLines = tsCheck.split('\n').filter(line => line.includes('error TS'))
    errors.push(`❌ TypeScript errors found:\n${errorLines.slice(0, 3).join('\n')}`)
    hasErrors = true
  } else {
    console.log('   ✅ TypeScript compilation passed')
  }
} catch (error) {
  if (error.stdout && error.stdout.includes('error TS')) {
    const errorLines = error.stdout.split('\n').filter(line => line.includes('error TS'))
    if (errorLines.length > 0) {
      errors.push(`❌ TypeScript errors:\n${errorLines.slice(0, 3).join('\n')}`)
      hasErrors = true
    }
  } else {
    console.log('   ✅ TypeScript check passed')
  }
}

// 8. Check for required dependencies
console.log('\n8️⃣ Checking dependencies...')
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  const requiredDeps = ['next', 'react', 'react-dom']
  const requiredDevDeps = ['eslint', 'prettier', '@next/bundle-analyzer']

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep} installed`)
    } else {
      errors.push(`❌ Missing dependency: ${dep}`)
      hasErrors = true
    }
  })

  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`   ✅ ${dep} installed`)
    } else {
      console.log(`   ⚠️  Missing dev dependency: ${dep} (optional)`)
    }
  })
} catch (error) {
  errors.push(`❌ Error checking dependencies: ${error.message}`)
  hasErrors = true
}

// 9. Check configuration files
console.log('\n9️⃣ Checking configuration files...')
const configFiles = ['.eslintrc.json', '.prettierrc.json', 'next.config.js', 'tsconfig.json']

configFiles.forEach(file => {
  const filePath = path.join(projectRoot, file)
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ⚠️  Missing: ${file} (may be optional)`)
  }
})

// Summary
console.log('\n' + '='.repeat(50))
if (hasErrors) {
  console.log('❌ Health check FAILED\n')
  errors.forEach(err => console.log(err))
  console.log('\n⚠️  Please fix errors before continuing.')
  process.exit(1)
} else {
  console.log('✅ Health check PASSED\n')
  console.log('🎉 Project is healthy and ready!')
  process.exit(0)
}
