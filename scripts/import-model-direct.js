/**
 * Скрипт для прямого импорта модели и дизайнов (копирование файлов + создание записей в БД)
 * Использование: node scripts/import-model-direct.js
 */

const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const MODEL_FOLDER = path.join(process.cwd(), 'public', 'models', 'MODEL')
const UPLOADS_FOLDER = path.join(process.cwd(), 'public', 'uploads')

async function copyFile(src, dest) {
  // Создаем директорию если не существует
  const destDir = path.dirname(dest)
  await fsPromises.mkdir(destDir, { recursive: true })
  
  // Копируем файл
  await fsPromises.copyFile(src, dest)
  console.log(`  ✅ Скопировано: ${path.relative(process.cwd(), dest)}`)
  
  // Возвращаем публичный URL
  return dest.replace(path.join(process.cwd(), 'public'), '')
}

async function importModel() {
  console.log('🔍 Поиск модели...')
  
  const files = await fsPromises.readdir(MODEL_FOLDER)
  const glbFile = files.find(f => f.endsWith('.glb') && f.startsWith('MODEL-'))
  
  if (!glbFile) {
    throw new Error('❌ Модель не найдена в папке MODEL')
  }
  
  const modelPath = path.join(MODEL_FOLDER, glbFile)
  const fileName = glbFile
  const modelName = fileName.replace('MODEL-', '').replace('.glb', '').replace(/-/g, ' ')
  const modelId = modelName.toLowerCase().replace(/\s+/g, '-')
  
  console.log(`📦 Найдена модель: ${modelName}`)
  console.log(`📁 Путь: ${modelPath}`)
  
  // Копируем модель
  const modelDest = path.join(UPLOADS_FOLDER, 'models', fileName)
  const modelUrl = await copyFile(modelPath, modelDest)
  
  // Проверяем панораму
  let panoramaUrl = null
  try {
    const panoramaPath = path.join(MODEL_FOLDER, 'Panoramic-404.webp')
    await fsPromises.access(panoramaPath)
    const panoramaDest = path.join(UPLOADS_FOLDER, 'images', 'Panoramic-404.webp')
    panoramaUrl = await copyFile(panoramaPath, panoramaDest)
  } catch {
    console.log('ℹ️ Панорама не найдена, пропускаем')
  }
  
  // Создаем модель в БД
  console.log('📝 Создание модели в БД...')
  
  try {
    const existing = await prisma.scooterModel.findUnique({
      where: { slug: modelId },
    })
    
    if (existing) {
      console.log(`ℹ️ Модель "${modelId}" уже существует, обновляем...`)
      const updated = await prisma.scooterModel.update({
        where: { slug: modelId },
        data: {
          name: modelName,
          model: modelUrl,
          panorama: panoramaUrl,
        },
      })
      console.log(`✅ Модель обновлена: ${updated.slug}`)
    } else {
      const created = await prisma.scooterModel.create({
        data: {
          slug: modelId,
          name: modelName,
          model: modelUrl,
          panorama: panoramaUrl,
          active: true,
          order: 0,
        },
      })
      console.log(`✅ Модель создана: ${created.slug}`)
    }
  } catch (error) {
    throw new Error(`Failed to create model: ${error.message}`)
  }
  
  return { modelId, modelName }
}

async function importDesigns(modelId) {
  console.log('\n🔍 Поиск дизайнов...')
  
  const designsFolder = path.join(MODEL_FOLDER, 'DESIGNS')
  const designFolders = await fsPromises.readdir(designsFolder)
  
  const designs = []
  
  for (const designFolder of designFolders) {
    const designPath = path.join(designsFolder, designFolder)
    const stat = await fsPromises.stat(designPath)
    
    if (!stat.isDirectory()) continue
    
    console.log(`\n📁 Обработка дизайна: ${designFolder}`)
    
    const files = await fsPromises.readdir(designPath)
    
    // Находим файлы по паттернам
    const uvFile = files.find(f => f.startsWith('UV-') && (f.endsWith('.jpg') || f.endsWith('.png')))
    if (!uvFile) {
      console.error(`  ❌ UV текстура не найдена, пропускаем`)
      continue
    }
    
    const photoFiles = files.filter(f => f.startsWith('PHOTO-'))
    const videoFiles = files.filter(f => f.startsWith('Video-'))
    const bgFile = files.find(f => f.startsWith('panoram-'))
    
    console.log(`  📄 UV текстура: ${uvFile}`)
    console.log(`  📸 Фото: ${photoFiles.length}`)
    console.log(`  🎬 Видео: ${videoFiles.length}`)
    console.log(`  🌅 Фон: ${bgFile || 'нет'}`)
    
    // Копируем файлы
    const textureUrl = await copyFile(
      path.join(designPath, uvFile),
      path.join(UPLOADS_FOLDER, 'images', uvFile)
    )
    
    const photos = []
    for (const photoFile of photoFiles) {
      const photoUrl = await copyFile(
        path.join(designPath, photoFile),
        path.join(UPLOADS_FOLDER, 'images', photoFile)
      )
      photos.push(photoUrl)
    }
    
    const videos = []
    for (const videoFile of videoFiles) {
      const videoUrl = await copyFile(
        path.join(designPath, videoFile),
        path.join(UPLOADS_FOLDER, 'videos', videoFile)
      )
      videos.push(videoUrl)
    }
    
    let backgroundUrl = null
    if (bgFile) {
      backgroundUrl = await copyFile(
        path.join(designPath, bgFile),
        path.join(UPLOADS_FOLDER, 'images', bgFile)
      )
    }
    
    designs.push({
      name: designFolder,
      textureUrl,
      photos,
      videos,
      background: backgroundUrl,
    })
  }
  
  return designs
}

async function createDesign(modelId, design) {
  console.log(`\n📝 Создание дизайна: ${design.name}`)
  
  const designSlug = design.name.toLowerCase().replace(/\s+/g, '-')
  
  // Получаем модель для получения ID
  const model = await prisma.scooterModel.findUnique({
    where: { slug: modelId },
    select: { id: true },
  })
  
  if (!model) {
    throw new Error(`Model with slug "${modelId}" not found`)
  }
  
  try {
    const existing = await prisma.design.findUnique({
      where: { slug: designSlug },
    })
    
    if (existing) {
      console.log(`  ℹ️ Дизайн "${designSlug}" уже существует, пропускаем`)
      return
    }
    
    // Используем createDesign action
    const { createDesign } = require('../app/admin/designs/actions')
    
    const created = await createDesign({
      title: design.name,
      slug: designSlug,
      scooterModel: modelId,
      textureUrl: design.textureUrl,
      galleryImages: design.photos,
      videoPreview: design.videos.length > 0 ? design.videos[0] : undefined,
      panorama: design.background,
    })
    
    console.log(`  ✅ Дизайн создан: ${created.slug}`)
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log(`  ℹ️ Дизайн "${designSlug}" уже существует, пропускаем`)
    } else {
      throw new Error(`Failed to create design: ${error.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Начало импорта модели и дизайнов из папки MODEL\n')
  console.log(`📂 Папка: ${MODEL_FOLDER}`)
  console.log(`📁 Uploads: ${UPLOADS_FOLDER}\n`)
  
  try {
    // Проверяем существование папки
    await fsPromises.access(MODEL_FOLDER)
    
    // Импортируем модель
    const { modelId, modelName } = await importModel()
    
    // Импортируем дизайны
    const designs = await importDesigns(modelId)
    console.log(`\n✅ Найдено дизайнов: ${designs.length}`)
    
    // Создаем дизайны
    for (const design of designs) {
      await createDesign(modelId, design)
    }
    
    console.log('\n🎉 Импорт завершен успешно!')
    console.log(`\n📊 Итого:`)
    console.log(`  - Модель: ${modelName} (${modelId})`)
    console.log(`  - Дизайнов: ${designs.length}`)
    
  } catch (error) {
    console.error('\n❌ Ошибка импорта:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

module.exports = { importModel, importDesigns, createDesign }




