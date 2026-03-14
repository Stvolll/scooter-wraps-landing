/**
 * Test API endpoint to verify materials are returned correctly
 * 
 * Run with: npx tsx scripts/test-api.ts
 */

async function testAPI() {
  console.log('🔍 Testing API endpoint...\n')

  try {
    // Test local API (if dev server is running)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/scooters`

    console.log(`📡 Fetching: ${apiUrl}`)

    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const scooters = data.scooters || {}

    console.log(`✅ API Response received`)
    console.log(`📊 Models found: ${Object.keys(scooters).length}\n`)

    // Check each model
    for (const [modelSlug, modelData] of Object.entries(scooters)) {
      const model = modelData as any
      console.log(`🏍️  Model: ${model.name} (${modelSlug})`)
      console.log(`   Designs: ${model.designs?.length || 0}`)

      if (model.designs && model.designs.length > 0) {
        const firstDesign = model.designs[0]
        
        // Check for materials array (new format)
        if (firstDesign.materials) {
          console.log(`   ✅ Has materials array: ${firstDesign.materials.length} materials`)
          firstDesign.materials.forEach((m: any) => {
            console.log(`      - ${m.format}: ${m.url.substring(0, 50)}...`)
          })
        } else {
          console.log(`   ⚠️  No materials array (using legacy format)`)
        }

        // Check for legacy fields (backward compatibility)
        if (firstDesign.textureUrl || firstDesign.texture) {
          console.log(`   ✅ Has legacy texture field (backward compatibility)`)
        }
        if (firstDesign.preview || firstDesign.coverImage) {
          console.log(`   ✅ Has legacy preview field (backward compatibility)`)
        }
      }
      console.log('')
    }

    console.log('✅ API test complete!')

  } catch (error: any) {
    if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      console.log('⚠️  Dev server is not running.')
      console.log('   Start it with: npm run dev')
      console.log('   Then run this script again.')
    } else {
      console.error('❌ API test failed:', error.message)
    }
  }
}

testAPI()



