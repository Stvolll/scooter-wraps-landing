import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Импортируем данные напрямую из config/scooters.js
async function loadScootersConfig() {
  try {
    // Динамический импорт для поддержки ES modules
    const config = await import('../config/scooters.js')
    return config.scooters
  } catch (error) {
    console.error('Ошибка загрузки конфигурации:', error)
    throw error
  }
}

async function main() {
  console.log('🌱 Начинаю seed...')
  
  try {
    const scootersConfig = await loadScootersConfig()
    
    console.log(`📦 Найдено ${Object.keys(scootersConfig).length} моделей скутеров`)
    
    for (const [slug, data] of Object.entries(scootersConfig)) {
      console.log(`\n🏍️  Обрабатываю модель: ${data.name} (${slug})`)
      
      // Создаем или обновляем модель скутера
      const scooterModel = await prisma.scooterModel.upsert({
        where: { slug },
        update: {
          name: data.name,
          model: data.model,
          panorama: data.panorama || null,
        },
        create: {
          slug,
          name: data.name,
          model: data.model,
          panorama: data.panorama || null,
          active: true,
          order: 0,
        },
      })
      
      console.log(`   ✓ Модель создана/обновлена: ${scooterModel.id}`)
      
      // Создаем дизайны для этой модели
      if (data.designs && Array.isArray(data.designs)) {
        console.log(`   📐 Создаю ${data.designs.length} дизайнов...`)
        
        for (const design of data.designs) {
          const designSlug = `${slug}-${design.id}`
          
          // Подготавливаем данные для текстур
          let textureUrl = design.texture || null
          
          // Если текстура - это объект с body/plastic/accents
          if (design.textures && typeof design.textures === 'object') {
            // Сохраним body текстуру как основную для обратной совместимости
            textureUrl = design.textures.body || design.textures.plastic || design.textures.accents || null
          }
          
          const designData = await prisma.design.upsert({
            where: { slug: designSlug },
            update: {
              title: design.name,
              scooterModelId: scooterModel.id,
              description: design.description || null,
              price: design.price ? parseInt(design.price.replace(/[^0-9]/g, '')) : 0,
              coverImage: design.preview || null,
              galleryImages: design.images || [],
              videoPreview: design.video || null,
              textureUrl,
              published: true,
              status: 'FOR_SALE',
            },
            create: {
              slug: designSlug,
              title: design.name,
              scooterModelId: scooterModel.id,
              description: design.description || null,
              price: design.price ? parseInt(design.price.replace(/[^0-9]/g, '')) : 0,
              coverImage: design.preview || null,
              galleryImages: design.images || [],
              videoPreview: design.video || null,
              textureUrl,
              published: true,
              status: 'FOR_SALE',
            },
          })
          
          console.log(`      ✓ Дизайн: ${designData.title}`)
          
          // Создаем записи текстур, если они есть
          if (design.textures && typeof design.textures === 'object') {
            const textureTypes = [
              { key: 'body', type: 'diffuse' },
              { key: 'plastic', type: 'diffuse' },
              { key: 'accents', type: 'diffuse' },
            ]
            
            for (const { key, type } of textureTypes) {
              if (design.textures[key]) {
                await prisma.designTexture.upsert({
                  where: {
                    designId_type_layer: {
                      designId: designData.id,
                      type: `${key}_${type}`,
                      layer: 0,
                    },
                  },
                  update: {
                    url: design.textures[key],
                    format: 'webp',
                  },
                  create: {
                    designId: designData.id,
                    url: design.textures[key],
                    type: `${key}_${type}`,
                    format: 'webp',
                    layer: 0,
                  },
                })
              }
            }
          }
        }
      }
    }
    
    console.log('\n✅ Seed успешно завершен!')
    
    // Показываем статистику
    const modelsCount = await prisma.scooterModel.count()
    const designsCount = await prisma.design.count()
    
    console.log(`\n📊 Статистика:`)
    console.log(`   Моделей скутеров: ${modelsCount}`)
    console.log(`   Дизайнов: ${designsCount}`)
    
  } catch (error) {
    console.error('❌ Ошибка при seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

